import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    organization: { type: String, required: true, trim: true },
    bannerImage: { type: String, default: "" },
    bannerFilename: { type: String, default: "" },

    // Award category — references a Category document created by an admin/organizer
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

    platformCommission: { type: Number, default: 0.15 },

    totalVotes: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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

eventSchema.pre("save", function (next) {
  this.organizerId = this.organizer;
  next();
});

eventSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Event", eventSchema);
