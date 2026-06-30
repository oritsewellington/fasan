import Event     from '../models/Event.model.js';
import Candidate from '../models/Candidate.model.js';
import Vote      from '../models/Vote.model.js';
import User      from '../models/User.model.js';

// GET /api/stats/admin
export async function getAdminStats(req, res) {
  const [votes, events, organizers] = await Promise.all([
    Vote.find({ status: 'verified' }),
    Event.find(),
    User.find({ role: 'organizer' }),
  ]);

  const now          = new Date();
  const totalRevenue = votes.reduce((s, v) => s + v.amount, 0);
  const platformCuts = votes.reduce((s, v) => s + v.platformCut, 0);
  const organizerPayouts = votes.reduce((s, v) => s + v.organizerCut, 0);
  const totalVotes   = votes.reduce((s, v) => s + v.votes, 0);
  const activeEvents = events.filter(e => e.isOpen && now >= e.startDate && now <= e.endDate).length;
  const platformCommission = parseFloat(process.env.PLATFORM_COMMISSION) || 0.15;

  res.json({
    totalRevenue, platformCuts, organizerPayouts, totalVotes,
    totalEvents: events.length, activeEvents,
    totalOrganizers: organizers.length, platformCommission,
  });
}

// GET /api/stats/organizer/:organizerId
export async function getOrganizerStats(req, res) {
  const { organizerId } = req.params;
  if (req.user.role === 'organizer' && req.user._id.toString() !== organizerId)
    return res.status(403).json({ message: 'Access denied.' });

  const organizer = await User.findById(organizerId);
  if (!organizer) return res.status(404).json({ message: 'Organizer not found.' });

  const [votes, events] = await Promise.all([
    Vote.find({ organizerId, status: 'verified' }),
    Event.find({ organizer: organizerId }),
  ]);

  const now = new Date();
  res.json({
    totalVotes:    votes.reduce((s, v) => s + v.votes, 0),
    totalRevenue:  votes.reduce((s, v) => s + v.amount, 0),
    totalEarnings: votes.reduce((s, v) => s + v.organizerCut, 0),
    platformCommission: organizer.platformCommission,
    totalEvents:   events.length,
    activeEvents:  events.filter(e => e.isOpen && now >= e.startDate && now <= e.endDate).length,
  });
}

// GET /api/stats/event/:eventId
export async function getEventStats(req, res) {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found.' });

  if (req.user.role === 'organizer' && event.organizer.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Access denied.' });

  const [candidates, votes] = await Promise.all([
    Candidate.find({ event: eventId }).sort('-totalVotes'),
    Vote.find({ event: eventId, status: 'verified' }).sort('-createdAt').limit(50),
  ]);

  res.json({
    event, candidates, recentVotes: votes,
    totalVotes:   event.totalVotes,
    totalRevenue: event.totalRevenue,
    platformCut:  Math.round((event.totalRevenue || 0) * event.platformCommission),
    organizerCut: Math.round((event.totalRevenue || 0) * (1 - event.platformCommission)),
  });
}

// GET /api/stats/transactions
export async function getRecentTransactions(req, res) {
  const { limit = 50, organizerId } = req.query;
  const filter = { status: 'verified' };
  if (req.user.role === 'organizer') filter.organizerId = req.user._id;
  else if (organizerId) filter.organizerId = organizerId;
  const transactions = await Vote.find(filter).sort('-createdAt').limit(parseInt(limit));
  res.json(transactions);
}
