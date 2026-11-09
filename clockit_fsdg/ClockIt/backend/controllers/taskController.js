const Task = require("../models/Task");
const { isDbConnected } = require("../utils/dbStatus");
const memoryStore = require("../utils/memoryStore");
const sendError = require('../utils/sendError');

// Only these fields may be changed through PATCH /api/tasks/:id.
const UPDATABLE_TASK_FIELDS = ["text", "completed", "priority", "deadline"];

function pickTaskUpdates(body = {}) {
    const updates = {};
    UPDATABLE_TASK_FIELDS.forEach((field) => {
        if (body[field] !== undefined) {
            updates[field] = body[field];
        }
    });
    return updates;
}

// Treat the search box text literally, not as a regular expression.
function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/tasks?search=&priority=
// Scoped to the logged-in user (req.user comes from authMiddleware)
const getTasks = async (req, res) => {
    try {
        const { search, priority } = req.query;
        const userId = req.user.userId;

        if (!isDbConnected()) {
            let tasks = memoryStore.tasks.find((t) => t.user === userId);

            if (search) {
                const re = new RegExp(escapeRegex(search), "i");
                tasks = tasks.filter((t) => re.test(t.text));
            }

            if (priority) {
                tasks = tasks.filter((t) => t.priority === priority);
            }

            tasks.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            return res.json(tasks);
        }

        const filter = { user: userId };

        if (search) {
            filter.text = { $regex: escapeRegex(search), $options: "i" };
        }

        if (priority) {
            filter.priority = priority;
        }

        const tasks = await Task.find(filter).sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        sendError(res, error);
    }
};

// POST /api/tasks
const createTask = async (req, res) => {
    try {
        const { text, priority, deadline } = req.body;
        const userId = req.user.userId;

        if (!text || !text.trim()) {
            return res
                .status(400)
                .json({ message: "Task text cannot be empty" });
        }

        if (!isDbConnected()) {
            const task = memoryStore.tasks.insert({
                user: userId,
                text,
                completed: false,
                priority: priority || "low",
                deadline: deadline || null,
            });

            return res.status(201).json(task);
        }

        const task = await Task.create({
            user: userId,
            text,
            priority,
            deadline: deadline || null,
        });

        res.status(201).json(task);
    } catch (error) {
        sendError(res, error);
    }
};

// PATCH /api/tasks/:id
const updateTask = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!isDbConnected()) {
            const task = memoryStore.tasks.findById(req.params.id);

            if (!task || task.user !== userId) {
                return res
                    .status(404)
                    .json({ message: "Task not found" });
            }

            const updated = memoryStore.tasks.updateById(
                req.params.id,
                pickTaskUpdates(req.body)
            );

            return res.json(updated);
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            pickTaskUpdates(req.body),
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        sendError(res, error);
    }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!isDbConnected()) {
            const task = memoryStore.tasks.findById(req.params.id);

            if (!task || task.user !== userId) {
                return res
                    .status(404)
                    .json({ message: "Task not found" });
            }

            memoryStore.tasks.deleteById(req.params.id);

            return res.json({ message: "Task deleted successfully" });
        }

        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: userId,
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        sendError(res, error);
    }
};

// DELETE /api/tasks/completed
const deleteCompletedTasks = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!isDbConnected()) {
            memoryStore.tasks.deleteWhere(
                (t) => t.user === userId && t.completed
            );

            return res.json({
                message: "Completed tasks deleted successfully",
            });
        }

        await Task.deleteMany({
            user: userId,
            completed: true,
        });

        res.json({ message: "Completed tasks deleted successfully" });
    } catch (error) {
        sendError(res, error);
    }
};

// DELETE /api/tasks/overdue
const deleteOverdueTasks = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Deadlines are stored as midnight (UTC) of the chosen day, so a task
        // due TODAY must not count as overdue until today is over.
        const now = new Date();
        const startOfToday = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        );

        if (!isDbConnected()) {
            memoryStore.tasks.deleteWhere(
                (t) =>
                    t.user === userId &&
                    !t.completed &&
                    t.deadline &&
                    new Date(t.deadline) < startOfToday
            );

            return res.json({
                message: "Overdue tasks deleted successfully",
            });
        }

        await Task.deleteMany({
            user: userId,
            completed: false,
            deadline: { $ne: null, $lt: startOfToday },
        });

        res.json({ message: "Overdue tasks deleted successfully" });
    } catch (error) {
        sendError(res, error);
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    deleteCompletedTasks,
    deleteOverdueTasks,
};
