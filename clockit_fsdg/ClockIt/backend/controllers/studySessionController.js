const StudySession = require('../models/StudySession');
const { isDbConnected } = require('../utils/dbStatus');
const memoryStore = require('../utils/memoryStore');
const sendError = require('../utils/sendError');

exports.createSession = async (req, res) => {
  try {
    const { courseName, duration, startedAt, technique } = req.body;
    const userId = req.user.userId;

    if (!courseName || !String(courseName).trim()) {
      return res.status(400).json({ message: 'Please choose a subject first' });
    }

    if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
      return res.status(400).json({ message: 'Session duration must be greater than 0' });
    }

    if (!startedAt || Number.isNaN(new Date(startedAt).getTime())) {
      return res.status(400).json({ message: 'A valid start time is required' });
    }

    if (!isDbConnected()) {
      const session = memoryStore.sessions.insert({
        courseName,
        duration,
        startedAt,
        technique: technique || 'pomodoro',
        user: userId,
      });

      return res.status(201).json(session);
    }

    const session = await StudySession.create({
      courseName,
      duration,
      startedAt,
      technique,
      user: userId,
    });
    res.status(201).json(session);
  } catch (err) {
    sendError(res, err);
  }
};

exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!isDbConnected()) {
      const sessions = memoryStore.sessions
        .find((s) => s.user === userId)
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

      return res.json(sessions);
    }

    const sessions = await StudySession.find({ user: userId }).sort({ startedAt: -1 });
    res.json(sessions);
  } catch (err) {
    sendError(res, err);
  }
};