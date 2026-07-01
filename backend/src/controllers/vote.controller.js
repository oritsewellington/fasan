import axios from "axios";
import Vote from "../models/Vote.model.js";
import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";

const PAYSTACK_BASE = "https://api.paystack.co";
const paystackHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

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

// POST /api/votes/verify/:reference
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
      { headers: paystackHeaders() },
    );
    paystackData = response.data;
  } catch (err) {
    vote.status = "failed";
    await vote.save();
    return res
      .status(502)
      .json({ message: "Could not reach Paystack to verify payment." });
  }

  if (!paystackData.status || paystackData.data?.status !== "success") {
    vote.status = "failed";
    await vote.save();
    return res.status(400).json({ message: "Payment was not successful." });
  }

  if (paystackData.data.amount !== vote.amount) {
    vote.status = "failed";
    await vote.save();
    return res
      .status(400)
      .json({ message: "Payment amount mismatch. Contact support." });
  }

  vote.status = "verified";
  await vote.save();

  // This is the single source of truth the poll reads from — accurate
  // the moment a payment clears, no separate aggregation step needed.
  await Candidate.findByIdAndUpdate(vote.candidate, {
    $inc: { totalVotes: vote.votes, totalRevenue: vote.amount },
  });
  await Event.findByIdAndUpdate(vote.event, {
    $inc: { totalVotes: vote.votes, totalRevenue: vote.amount },
  });

  res.json({ message: "Vote recorded successfully.", vote });
}

// GET /api/votes
export async function getVotes(req, res) {
  const filter = { status: "verified" };
  if (req.query.eventId) filter.event = req.query.eventId;
  const votes = await Vote.find(filter).sort("-createdAt").limit(200);
  res.json(votes);
}
