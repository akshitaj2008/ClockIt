const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const { getSubjects, createSubject } = require('../controllers/subjectController');

router.use(authenticateToken);

router.get('/', getSubjects);
router.post('/', createSubject);

module.exports = router;