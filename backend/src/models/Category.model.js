import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    group: { type: String, required: true, trim: true },
    emoji: { type: String, default: "🏆", trim: true },
    description: { type: String, default: "", trim: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

categorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

export default mongoose.model("Category", categorySchema);
