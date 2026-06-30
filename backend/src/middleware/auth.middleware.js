import jwt  from 'jsonwebtoken';
import User from '../models/User.model.js';

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authenticated.' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found.' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required.' });
  next();
}

export function requireOrganizer(req, res, next) {
  if (!['admin', 'organizer'].includes(req.user?.role))
    return res.status(403).json({ message: 'Organizer access required.' });
  next();
}
