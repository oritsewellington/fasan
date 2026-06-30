import jwt  from 'jsonwebtoken';
import User from '../models/User.model.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid email or password.' });

  const token = signToken(user._id);
  res.json({ token, user: user.toSafeJSON() });
}

export async function getMe(req, res) {
  res.json(req.user);
}

export async function getOrganizers(req, res) {
  const organizers = await User.find({ role: 'organizer' }).sort('-createdAt');
  res.json(organizers);
}

export async function createOrganizer(req, res) {
  const { name, email, password, platformCommission } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email, and password are required.' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use.' });

  const user = await User.create({
    name, email, password, role: 'organizer',
    platformCommission: platformCommission ?? parseFloat(process.env.PLATFORM_COMMISSION) ?? 0.15,
  });
  res.status(201).json(user.toSafeJSON());
}

export async function updateCommission(req, res) {
  const { commission } = req.body;
  if (commission == null || commission < 0 || commission > 1)
    return res.status(400).json({ message: 'Commission must be between 0 and 1.' });

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { platformCommission: commission },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: 'Organizer not found.' });
  res.json(user.toSafeJSON());
}
