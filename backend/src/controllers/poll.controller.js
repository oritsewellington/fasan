import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";

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

export async function getEventPoll(req, res) {
  try {
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
      votes: c.totalVotes || 0,
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
  } catch (error) {
    console.error("Error in getEventPoll:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getAllPolls(req, res) {
  try {
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
  } catch (error) {
    console.error("Error in getAllPolls:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
