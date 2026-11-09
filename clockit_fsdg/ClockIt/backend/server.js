const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Fail fast with a clear message instead of a vague 500 on every login.
if (!process.env.JWT_SECRET) {
    console.error(
        "❌ JWT_SECRET is not set. Add it to backend/.env (or your host's " +
        "environment variables) before starting the server."
    );
    process.exit(1);
}

connectDB();

const app = express();

// CORS_ORIGIN can be a single URL or a comma-separated list of allowed
// frontend URLs, e.g. https://clockit.vercel.app. If it isn't set, every
// origin is allowed (fine for local development).
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(
    cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined)
);
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const taskRoutes = require("./routes/taskRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/sessions", studySessionRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Unknown URLs -> a clean JSON 404 instead of an HTML error page.
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Catch-all for errors Express itself raises (e.g. a malformed JSON body),
// so the client always gets a JSON message instead of a stack trace.
app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
        message: status >= 500 ? "Something went wrong on the server" : err.message,
    });
});

// A stray rejected promise should be logged, not take the whole server down
// in the middle of a demo.
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
