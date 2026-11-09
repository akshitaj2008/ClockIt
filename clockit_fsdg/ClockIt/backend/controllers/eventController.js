const Event = require("../models/Event");
const { isDbConnected } = require("../utils/dbStatus");
const memoryStore = require("../utils/memoryStore");
const sendError = require('../utils/sendError');

const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];


function withDerivedDay(body) {
    if (body.day || !body.date) {
        return body;
    }

    const [year, month, day] = body.date.split("-").map(Number);
    const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];

    return { ...body, day: weekday };
}

// Only the attendance status can be changed through PATCH /events/:id.
function pickEventUpdates(body = {}) {
    return body.attendance !== undefined
        ? { attendance: body.attendance }
        : {};
}

function computeAttendanceStats(events) {
    const categories = {};

    events.forEach((event) => {
        const category = event.category || "Uncategorized";

        if (!categories[category]) {
            categories[category] = {
                present: 0,
                absent: 0,
                cancelled: 0,
            };
        }

        if (event.attendance === "Present") {
            categories[category].present++;
        }

        if (event.attendance === "Absent") {
            categories[category].absent++;
        }

        if (event.attendance === "Cancelled") {
            categories[category].cancelled++;
        }
    });

    return Object.keys(categories).map((category) => {
        const present = categories[category].present;
        const absent = categories[category].absent;
        const cancelled = categories[category].cancelled;

        const totalClasses = present + absent;

        const percentage =
            totalClasses === 0 ? 0 : (present / totalClasses) * 100;

        return {
            category,
            present,
            absent,
            cancelled,
            percentage: Number(percentage.toFixed(2)),
        };
    });
}

// Create Event
const createEvent = async (req, res) => {
    try {
        const userId = req.user.userId;
        const body = withDerivedDay(req.body);

        if (!body.title || !String(body.title).trim()) {
            return res.status(400).json({ message: "Event title is required" });
        }

        if (!body.date || !body.startTime || !body.endTime) {
            return res
                .status(400)
                .json({ message: "Date, start time and end time are required" });
        }

        if (body.endTime <= body.startTime) {
            return res
                .status(400)
                .json({ message: "End time must be after the start time" });
        }

        if (!isDbConnected()) {
            const event = memoryStore.events.insert({
                attendance: "Pending",
                recurring: false,
                color: "#839958",
                ...body,
                user: userId,
            });

            return res.status(201).json(event);
        }

        const event = await Event.create({ ...body, user: userId });
        res.status(201).json(event);
    } catch (error) {
        res
            .status(error.name === "ValidationError" ? 400 : 500)
            .json({ message: error.message });
    }
};

// Get All Events
const getEvents = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!isDbConnected()) {
            return res.json(
                memoryStore.events.find((e) => e.user === userId)
            );
        }

        const events = await Event.find({ user: userId });
        res.json(events);
    } catch (error) {
        sendError(res, error);
    }
};

// Update Attendance
const updateAttendance = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!isDbConnected()) {
            const event = memoryStore.events.findOne(
                (e) => e._id === req.params.id && e.user === userId
            );

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            const updated = memoryStore.events.updateById(
                req.params.id,
                pickEventUpdates(req.body)
            );

            return res.json(updated);
        }

        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            pickEventUpdates(req.body),
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json(event);
    } catch (error) {
        sendError(res, error);
    }
};

// Calculate Attendance Percentage by Category
const getAttendancePercentage = async (req, res) => {
    try {
        const userId = req.user.userId;

        const events = isDbConnected()
            ? await Event.find({ user: userId })
            : memoryStore.events.find((e) => e.user === userId);

        res.json(computeAttendanceStats(events));
    } catch (error) {
        sendError(res, error);
    }
};

// Delete Event
const deleteEvent = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!isDbConnected()) {
            const event = memoryStore.events.findOne(
                (e) => e._id === req.params.id && e.user === userId
            );

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            memoryStore.events.deleteById(req.params.id);

            return res.json({
                message: "Event deleted successfully",
            });
        }

        const deleted = await Event.findOneAndDelete({
            _id: req.params.id,
            user: userId,
        });

        if (!deleted) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json({
            message: "Event deleted successfully",
        });
    } catch (error) {
        sendError(res, error);
    }
};

module.exports = {
    createEvent,
    getEvents,
    updateAttendance,
    getAttendancePercentage,
    deleteEvent,
};