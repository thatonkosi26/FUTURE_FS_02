const router = require('express').Router();
const { getLeads, createLead, updateLead, deleteLead, getPublicStats } = require('../controllers/leadController');
const protect = require('../middleware/auth');

// Public — no auth required
router.get('/stats', getPublicStats);

// Protected routes
router.use(protect);
router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;