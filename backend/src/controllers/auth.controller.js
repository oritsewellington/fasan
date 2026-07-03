import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export async function login(req, res) {
  try {
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
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getMe(req, res) {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getStaff(req, res) {
  try {
    const staff = await User.find({ role: "staff" }).sort("-createdAt");
    res.json(staff);
  } catch (error) {
    console.error("Error in getStaff:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function createStaff(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already in use." });

    const user = await User.create({ name, email, password, role: "staff" });
    res.status(201).json(user.toSafeJSON());
  } catch (error) {
    console.error("Error in createStaff:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function deleteStaff(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Staff account not found." });
    if (user.role === "admin")
      return res
        .status(400)
        .json({ message: "Can't delete an admin account here." });

    await user.deleteOne();
    res.json({ message: "Staff account removed." });
  } catch (error) {
    console.error("Error in deleteStaff:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
