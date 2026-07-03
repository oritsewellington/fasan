import axios from "axios";
import Vote from "../models/Vote.model.js";
import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";

const PAYSTACK_BASE = "https://api.paystack.co";
const paystackHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

export async function creditVerifiedVote(vote) {
  try {
    if (vote.status === "verified") return vote;

    vote.status = "verified";
    await vote.save();

    await Candidate.findByIdAndUpdate(vote.candidate, {
      $inc: { totalVotes: vote.votes, totalRevenue: vote.amount },
    });
    await Event.findByIdAndUpdate(vote.event, {
      $inc: { totalVotes: vote.votes, totalRevenue: vote.amount },
    });

    return vote;
  } catch (error) {
    console.error("Error inside creditVerifiedVote routine:", error);
    throw error;
  }
}

export async function initializePayment(req, res) {
  try {
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

    const vote = await Vote.create({
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

    res.json({
      message: "Payment initialized.",
      amount: totalAmount,
      reference,
    });
  } catch (error) {
    console.error("Error in initializePayment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function verifyPayment(req, res) {
  try {
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
      console.error(
        "External connection tracking error to Paystack:",
        err.message,
      );
      return res.status(502).json({
        message:
          "Could not reach Paystack to verify payment. Your vote will still be confirmed automatically once payment clears — check back shortly.",
      });
    }

    if (!paystackData.status || paystackData.data?.status !== "success") {
      vote.status = "failed";
      await vote.save();
      return res.status(400).json({ message: "Payment was not successful." });
    }

    if (paystackData.data.amount !== vote.amount) {
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
  } catch (error) {
    console.error("Error in verifyPayment wrapper logic:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getVotes(req, res) {
  try {
    const filter = { status: "verified" };
    if (req.query.eventId) filter.event = req.query.eventId;
    const votes = await Vote.find(filter).sort("-createdAt").limit(200);
    res.json(votes);
  } catch (error) {
    console.error("Error in getVotes:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
