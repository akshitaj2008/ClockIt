const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    createEvent,
    getEvents,
    updateAttendance,
    getAttendancePercentage,
    deleteEvent,
} = require("../controllers/eventController");

router.use(authenticateToken);

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/attendance/percentage", getAttendancePercentage);
router.patch("/:id", updateAttendance);
router.delete("/:id", deleteEvent);

module.exports = router;