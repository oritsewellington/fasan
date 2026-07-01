import Event from "../models/Event.model.js";
import Candidate from "../models/Candidate.model.js";
import Vote from "../models/Vote.model.js";
import User from "../models/User.model.js";

const PLATFORM_COMMISSION = parseFloat(process.env.PLATFORM_COMMISSION) || 0.1;

// GET /api/stats/admin
export async function getAdminStats(req, res) {
  const [events, staffCount] = await Promise.all([
    Event.find(),
    User.countDocuments({ role: "staff" }),
  ]);

  const now = new Date();
  const totalRevenue = events.reduce((s, e) => s + (e.totalRevenue || 0), 0);
  const totalVotes = events.reduce((s, e) => s + (e.totalVotes || 0), 0);
  const activeEvents = events.filter(
    (e) => e.isOpen && now >= e.startDate && now <= e.endDate,
  ).length;
  const platformEarnings = Math.round(totalRevenue * PLATFORM_COMMISSION);
  const schoolPayable = totalRevenue - platformEarnings;

  res.json({
    totalRevenue,
    platformEarnings,
    schoolPayable,
    platformCommission: PLATFORM_COMMISSION,
    totalVotes,
    totalEvents: events.length,
    activeEvents,
    totalStaff: staffCount,
  });
}

export async function getStaffStats(req, res) {
  const events = await Event.find();
  const now = new Date();

  // Calculate values so we can pass them down to the staff payload
  const totalRevenue = events.reduce((s, e) => s + (e.totalRevenue || 0), 0);
  const platformEarnings = Math.round(totalRevenue * PLATFORM_COMMISSION);
  const schoolPayable = totalRevenue - platformEarnings;

  res.json({
    totalVotes: events.reduce((s, e) => s + (e.totalVotes || 0), 0),
    totalEvents: events.length,
    activeEvents: events.filter(
      (e) => e.isOpen && now >= e.startDate && now <= e.endDate,
    ).length,
    totalRevenue,
    platformEarnings,
    schoolPayable,
    platformCommission: PLATFORM_COMMISSION,
  });
}

// GET /api/stats/event/:eventId  (any admin or staff)
export async function getEventStats(req, res) {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: "Event not found." });

  const [candidates, recentVotes] = await Promise.all([
    Candidate.find({ event: eventId }).sort("-totalVotes"),
    Vote.find({ event: eventId, status: "verified" })
      .sort("-createdAt")
      .limit(50),
  ]);

  res.json({
    event,
    candidates,
    recentVotes,
    totalVotes: event.totalVotes,
    totalRevenue: event.totalRevenue,
  });
}

// GET /api/stats/transactions  (any admin or staff)
export async function getRecentTransactions(req, res) {
  const { limit = 50, eventId } = req.query;
  const filter = { status: "verified" };
  if (eventId) filter.event = eventId;
  const transactions = await Vote.find(filter)
    .sort("-createdAt")
    .limit(parseInt(limit));
  res.json(transactions);
}
