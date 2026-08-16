const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        default: "Uncategorized",
    },

    day: {
        type: String,
    },

    color: {
        type: String,
        default: "#839958",
    },

    startTime: {
        type: String,
        required: true,
    },

    endTime: {
        type: String,
        required: true,
    },

    date: {
        type: String,
    },

    attendance: {
        type: String,
        enum: ["Pending", "Present", "Absent", "Cancelled"],
        default: "Pending",
    },

    recurring: {
        type: Boolean,
        default: false,
    },

    repeatUntil: {
        type: String,
    },
});

module.exports = mongoose.model("Event", eventSchema);