const Note = require('../models/Note');

exports.getNotesByLead = async (req, res, next) => {
  try {
    const notes = await Note.find({ leadId: req.params.leadId }).sort('-createdAt');
    res.json({ success: true, notes });
  } catch (err) {
    next(err);
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json({ success: true, note });
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
};
