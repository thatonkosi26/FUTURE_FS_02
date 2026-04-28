const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  source: {
    type: String,
    enum: ['website', 'referral', 'social', 'email', 'cold_call', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'proposal', 'converted', 'lost'],
    default: 'new'
  },
  value: { type: Number, default: 0 },
  tags: [{ type: String }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
