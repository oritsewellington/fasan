import mongoose from "mongoose";
import dotenv from "dotenv";

import Candidate from "../models/Candidate.model.js";
import Vote from "../models/Vote.model.js";

dotenv.config();

async function repairCandidateVotes() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // or your DB connection string

    console.log("Connected to MongoDB");

    const candidates = await Candidate.find();

    for (const candidate of candidates) {
      const result = await Vote.aggregate([
        {
          $match: {
            candidate: candidate._id,
            status: "verified",
          },
        },
        {
          $group: {
            _id: null,
            totalVotes: {
              $sum: "$votes",
            },
            totalRevenue: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const totalVotes = result[0]?.totalVotes || 0;
      const totalRevenue = result[0]?.totalRevenue || 0;

      await Candidate.findByIdAndUpdate(candidate._id, {
        totalVotes,
        totalRevenue,
      });

      console.log(`${candidate.name}: ${totalVotes} votes - ₦${totalRevenue}`);
    }

    console.log("Repair completed.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

repairCandidateVotes();
