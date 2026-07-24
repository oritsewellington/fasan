import mongoose from "mongoose";
import dotenv from "dotenv";

import Event from "../models/Event.model.js";
import Vote from "../models/Vote.model.js";

dotenv.config();

async function repairEventTotals() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const events = await Event.find();

    for (const event of events) {
      const result = await Vote.aggregate([
        {
          $match: {
            event: event._id,
            status: "verified",
          },
        },
        {
          $group: {
            _id: null,
            totalVotes: { $sum: "$votes" },
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]);

      const totalVotes = result[0]?.totalVotes || 0;
      const totalRevenue = result[0]?.totalRevenue || 0;

      await Event.findByIdAndUpdate(event._id, { totalVotes, totalRevenue });

      console.log(`${event.title}: ${totalVotes} votes - ₦${totalRevenue}`);
    }

    console.log("Event totals repair completed.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

repairEventTotals();
