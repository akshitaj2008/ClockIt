const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const { createSession, getSessions } = require('../controllers/studySessionController');

router.use(authenticateToken);

router.post('/', createSession);
router.get('/', getSessions);

module.exports = router;