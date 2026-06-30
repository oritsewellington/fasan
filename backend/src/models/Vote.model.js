import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  voterName:  { type: String, required: true, trim: true },
  voterEmail: { type: String, required: true, lowercase: true, trim: true },
  event:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event',     required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  eventTitle:    { type: String },
  candidateName: { type: String },
  organizerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  votes:  { type: Number, required: true, min: 1 },
  amount: { type: Number, required: true },
  platformCommission: { type: Number, required: true },
  platformCut:        { type: Number, required: true },
  organizerCut:       { type: Number, required: true },
  reference: { type: String, required: true, unique: true },
  status:    { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
}, { timestamps: true });

voteSchema.index({ event: 1, createdAt: -1 });
voteSchema.index({ organizerId: 1, createdAt: -1 });
voteSchema.index({ reference: 1 });

export default mongoose.model('Vote', voteSchema);
