import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  bio:             { type: String, default: '' },
  department:      { type: String, default: '' },
  level:           { type: String, default: '' },

  photo:           { type: String, default: '' },
  photoFilename:   { type: String, default: '' },

  // Auto-generated unique candidate number per event: FASA-XXXX
  candidateNumber: { type: Number, required: true },
  candidateCode:   { type: String, default: '' }, // e.g. "FASA-0001"

  event:           { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },

  totalVotes:      { type: Number, default: 0 },
  totalRevenue:    { type: Number, default: 0 },
}, { timestamps: true });

candidateSchema.index({ event: 1, candidateNumber: 1 }, { unique: true });

// Auto-generate candidateCode before save
candidateSchema.pre('save', function (next) {
  if (!this.candidateCode) {
    this.candidateCode = 'FASA-' + String(this.candidateNumber).padStart(4, '0');
  }
  next();
});

export default mongoose.model('Candidate', candidateSchema);
