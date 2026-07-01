import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// Verifies the JWT and attaches the user to req.user
export async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not authenticated." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: "User no longer exists." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// Admin only (e.g. managing staff accounts)
export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required." });
  next();
}

// Admin OR staff — both can manage all events/candidates/categories,
// regardless of who created them. No ownership check by design.
export function requireStaff(req, res, next) {
  if (!["admin", "staff"].includes(req.user.role))
    return res.status(403).json({ message: "Access denied." });
  next();
}
