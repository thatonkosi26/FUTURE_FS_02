const router = require('express').Router();
const { getNotesByLead, createNote, deleteNote } = require('../controllers/noteController');
const protect = require('../middleware/auth');

router.use(protect);
router.get('/:leadId', getNotesByLead);
router.post('/', createNote);
router.delete('/:id', deleteNote);

module.exports = router;
