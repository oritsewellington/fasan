import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: "Invalid email or password." });

  const token = signToken(user._id);
  res.json({ token, user: user.toSafeJSON() });
}

export async function getMe(req, res) {
  res.json(req.user);
}

// GET /api/auth/staff  (admin only — list seeded staff accounts)
export async function getStaff(req, res) {
  const staff = await User.find({ role: "staff" }).sort("-createdAt");
  res.json(staff);
}

// POST /api/auth/staff  (admin only — seed a login for a staff member)
export async function createStaff(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use." });

  const user = await User.create({ name, email, password, role: "staff" });
  res.status(201).json(user.toSafeJSON());
}

// DELETE /api/auth/staff/:id  (admin only — revoke a staff login)
export async function deleteStaff(req, res) {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ message: "Staff account not found." });
  if (user.role === "admin")
    return res
      .status(400)
      .json({ message: "Can't delete an admin account here." });

  await user.deleteOne();
  res.json({ message: "Staff account removed." });
}
