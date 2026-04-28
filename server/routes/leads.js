const router = require('express').Router();
const { getLeads, createLead, updateLead, deleteLead } = require('../controllers/leadController');
const protect = require('../middleware/auth');

router.use(protect);
router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
