const Subject = require('../models/Subject');
const { isDbConnected } = require('../utils/dbStatus');
const memoryStore = require('../utils/memoryStore');
const sendError = require('../utils/sendError');

const PALETTE = ['#C9A24B', '#4FA98C', '#8C5A4B', '#6E8FB0', '#A6789A'];

exports.getSubjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!isDbConnected()) {
      const subjects = memoryStore.subjects
        .find((s) => s.user === userId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      return res.json(subjects);
    }

    const subjects = await Subject.find({ user: userId }).sort({ createdAt: 1 });
    res.json(subjects);
  } catch (err) {
    sendError(res, err);
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { name, color: requestedColor } = req.body;
    const userId = req.user.userId;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const cleanName = String(name).trim();
    const sameName = (s) =>
      String(s.name).trim().toLowerCase() === cleanName.toLowerCase();

    if (!isDbConnected()) {
      const mine = memoryStore.subjects.find((s) => s.user === userId);
      const existing = mine.find(sameName);
      if (existing) return res.status(200).json(existing);

      const count = mine.length;
      const color = requestedColor || PALETTE[count % PALETTE.length];
      const subject = memoryStore.subjects.insert({ name: cleanName, color, user: userId });

      return res.status(201).json(subject);
    }

    const existing = (await Subject.find({ user: userId })).find(sameName);
    if (existing) return res.status(200).json(existing);

    const count = await Subject.countDocuments({ user: userId });
    const color = requestedColor || PALETTE[count % PALETTE.length];
    const subject = await Subject.create({ name: cleanName, color, user: userId });
    res.status(201).json(subject);
  } catch (err) {
    sendError(res, err);
  }
};