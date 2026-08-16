const StudySession = require('../models/StudySession');
const { isDbConnected } = require('../utils/dbStatus');
const memoryStore = require('../utils/memoryStore');

exports.createSession = async (req, res) => {
  try {
    const { courseName, duration, startedAt, technique } = req.body;
    const userId = req.user.userId;

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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
};