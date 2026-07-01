import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    voterName: { type: String, required: true, trim: true },
    voterEmail: { type: String, required: true, lowercase: true, trim: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    eventTitle: { type: String },
    candidateName: { type: String },

    votes: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true }, // total revenue from this transaction

    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

voteSchema.index({ event: 1, createdAt: -1 });

export default mongoose.model("Vote", voteSchema);
