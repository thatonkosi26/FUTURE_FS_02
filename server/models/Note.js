const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  content: { type: String, required: true, trim: true },
  author: { type: String, default: 'Admin' },
  type: {
    type: String,
    enum: ['note', 'call', 'email', 'meeting'],
    default: 'note'
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
