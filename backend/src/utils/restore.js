import mongoose from "mongoose";
import dotenv from "dotenv";
import Vote from "../models/Vote.model.js";

dotenv.config();

async function restoreVotes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const result = await Vote.updateMany(
      { status: "failed" },
      { $set: { status: "verified" } },
    );

    console.log(
      `✅ Restored ${result.modifiedCount} votes back to 'verified'.`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Error restoring votes:", err);
    process.exit(1);
  }
}

restoreVotes();
