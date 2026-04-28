const Lead = require('../models/Lead');
const Note = require('../models/Note');

exports.getLeads = async (req, res, next) => {
  try {
    const { status, search, sort = '-createdAt' } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    const leads = await Lead.find(filter).sort(sort);

    // Stats
    const total = await Lead.countDocuments();
    const converted = await Lead.countDocuments({ status: 'converted' });
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const contacted = await Lead.countDocuments({ status: 'contacted' });
    const proposal = await Lead.countDocuments({ status: 'proposal' });

    res.json({
      success: true,
      leads,
      stats: {
        total, converted, newLeads, contacted, proposal,
        conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : 0
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    // Delete associated notes
    await Note.deleteMany({ leadId: req.params.id });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    next(err);
  }
};
