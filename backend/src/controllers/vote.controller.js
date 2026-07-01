import axios from "axios";
import Vote from "../models/Vote.model.js";
import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";

const PAYSTACK_BASE = "https://api.paystack.co";
const paystackHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

/**
 * Marks a vote verified and credits the candidate/event counters.
 * Idempotent — safe to call from both the browser callback (verifyPayment
 * below) AND the webhook (webhook.controller.js), whichever arrives
 * first. The second caller just no-ops. This is the ONLY place in the
 * codebase that increments totalVotes/totalRevenue — a vote is never
 * counted anywhere else, by design.
 */
export async function creditVerifiedVote(vote) {
  if (vote.status === "verified") return vote; // already credited, do nothing

  vote.status = "verified";
  await vote.save();

  await Candidate.findByIdAndUpdate(vote.candidate, {
    $inc: { totalVotes: vote.votes, totalRevenue: vote.amount },
  });
  await Event.findByIdAndUpdate(vote.event, {
    $inc: { totalVotes: vote.votes, totalRevenue: vote.amount },
  });

  return vote;
}

// POST /api/votes/initialize
export async function initializePayment(req, res) {
  const { email, name, candidateId, eventId, quantity, reference } = req.body;
  if (!email || !name || !candidateId || !eventId || !quantity || !reference)
    return res.status(400).json({ message: "Missing required fields." });

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: "Event not found." });

  const now = new Date();
  if (!event.isOpen || now < event.startDate || now > event.endDate)
    return res
      .status(400)
      .json({ message: "Voting is not currently open for this event." });

  const candidate = await Candidate.findOne({
    _id: candidateId,
    event: eventId,
  });
  if (!candidate)
    return res.status(404).json({ message: "Candidate not found." });

  const totalAmount = event.pricePerVote * quantity;

  const existingRef = await Vote.findOne({ reference });
  if (existingRef)
    return res.status(409).json({ message: "Duplicate payment reference." });

  await Vote.create({
    voterName: name,
    voterEmail: email,
    event: eventId,
    candidate: candidateId,
    eventTitle: event.title,
    candidateName: candidate.name,
    votes: quantity,
    amount: totalAmount,
    reference,
    status: "pending",
  });

  res.json({ message: "Payment initialized.", amount: totalAmount, reference });
}

/**
 * POST /api/votes/verify/:reference
 * Fires from your usePaystack onSuccess handler right after the inline
 * popup closes. Gives the voter instant feedback — but it's a courtesy
 * confirmation, not the only thing that can credit a vote. If this
 * request never arrives (closed tab, dropped connection, popup killed
 * by the OS), the webhook still credits it independently.
 */
export async function verifyPayment(req, res) {
  const { reference } = req.params;
  const vote = await Vote.findOne({ reference });
  if (!vote)
    return res.status(404).json({ message: "Payment reference not found." });
  if (vote.status === "verified")
    return res.json({ message: "Already verified.", vote });
  if (vote.status === "failed")
    return res.status(400).json({ message: "Payment already failed." });

  let paystackData;
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: paystackHeaders(), timeout: 10000 },
    );
    paystackData = response.data;
  } catch (err) {
    // Could not REACH Paystack — this tells us nothing about whether the
    // charge succeeded. Do NOT mark failed here; leave it pending. The
    // webhook (or a manual re-check) will resolve it once Paystack is
    // reachable again. Marking failed on a network blip is how you end
    // up with a real, paid vote sitting in your DB as "failed" forever.
    return res.status(502).json({
      message:
        "Could not reach Paystack to verify payment. Your vote will still be confirmed automatically once payment clears — check back shortly.",
    });
  }

  if (!paystackData.status || paystackData.data?.status !== "success") {
    // Paystack explicitly told us this charge did not succeed — safe to fail it.
    vote.status = "failed";
    await vote.save();
    return res.status(400).json({ message: "Payment was not successful." });
  }

  if (paystackData.data.amount !== vote.amount) {
    // Amount tampering or a client/price mismatch — never trust the
    // client's claimed amount, only what Paystack confirms was charged.
    vote.status = "failed";
    await vote.save();
    console.error(
      `Amount mismatch on ${reference}: expected ${vote.amount}, got ${paystackData.data.amount}`,
    );
    return res
      .status(400)
      .json({ message: "Payment amount mismatch. Contact support." });
  }

  await creditVerifiedVote(vote);
  res.json({ message: "Vote recorded successfully.", vote });
}

// GET /api/votes  (admin only — includes voter PII, kept out of the general staff scope)
export async function getVotes(req, res) {
  const filter = { status: "verified" };
  if (req.query.eventId) filter.event = req.query.eventId;
  const votes = await Vote.find(filter).sort("-createdAt").limit(200);
  res.json(votes);
}
