import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";

/**
 * Ranks candidates by votes, assigns TIED ranks (1, 2, 2, 4 ...), and
 * computes:
 *  - shareOfTotal:  this candidate's votes as a % of all votes cast
 *                    in the event (factual "share of the field")
 *  - shareOfLeader: this candidate's votes relative to the leader's
 *                    votes (drives bar length — leader is always 100%,
 *                    everyone else shows how far behind they are)
 */
function rankCandidates(candidates) {
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((s, c) => s + c.votes, 0) || 1;
  const leaderVotes = sorted[0]?.votes || 0;

  let lastVotes = null;
  let lastRank = 0;

  return sorted.map((c, i) => {
    const rank = c.votes === lastVotes ? lastRank : i + 1;
    lastVotes = c.votes;
    lastRank = rank;
    return {
      ...c,
      rank,
      shareOfTotal: Number(((c.votes / totalVotes) * 100).toFixed(1)),
      shareOfLeader: leaderVotes
        ? Number(((c.votes / leaderVotes) * 100).toFixed(1))
        : 0,
    };
  });
}

// GET /api/polls/:eventId
// Full live standings for one event's candidates.
export async function getEventPoll(req, res) {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: "Event not found." });

  const candidates = await Candidate.find({ event: eventId })
    .sort("candidateNumber")
    .lean();

  const withVotes = candidates.map((c) => ({
    id: c._id,
    name: c.name,
    photo: c.photo || "",
    candidateCode: c.candidateCode,
    votes: c.totalVotes || 0, // already accurate — incremented on every verified payment
  }));

  const ranked = rankCandidates(withVotes);

  res.json({
    eventId: event._id,
    eventTitle: event.title,
    category: event.category,
    totalVotes: event.totalVotes || 0,
    updatedAt: new Date().toISOString(),
    candidates: ranked,
  });
}

// GET /api/polls
// Lightweight summary across every event — powers the /polls index page.
// No per-candidate breakdown here, just the current leader.
export async function getAllPolls(req, res) {
  const events = await Event.find().sort("category title").lean();

  const summaries = await Promise.all(
    events.map(async (event) => {
      const leader = await Candidate.findOne({ event: event._id })
        .sort("-totalVotes")
        .lean();

      return {
        eventId: event._id,
        eventTitle: event.title,
        category: event.category,
        categoryId: event.categoryId,
        totalVotes: event.totalVotes || 0,
        leaderName: leader?.name || null,
        leaderVotes: leader?.totalVotes || 0,
      };
    }),
  );

  res.json(summaries);
}
