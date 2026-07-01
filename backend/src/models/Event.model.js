import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    organization: { type: String, required: true, trim: true },
    bannerImage: { type: String, default: "" },
    bannerPublicId: { type: String, default: "" },

    category: { type: String, default: "" }, // denormalized name, kept for fast display
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isOpen: { type: Boolean, default: true },

    // Price per vote in kobo (50 naira = 5000 kobo)
    pricePerVote: { type: Number, required: true, min: 100 },

    totalVotes: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    // Audit trail only — NOT used for permission checks anymore.
    // Any admin/staff account can edit any event regardless of who created it.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

eventSchema.index({ categoryId: 1 });

eventSchema.virtual("status").get(function () {
  const now = new Date();
  if (!this.isOpen) return "closed";
  if (now < this.startDate) return "upcoming";
  if (now > this.endDate) return "closed";
  return "open";
});

eventSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Event", eventSchema);
