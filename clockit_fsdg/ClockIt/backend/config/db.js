const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");
    } catch (error) {
        // IMPORTANT: we deliberately do NOT call process.exit() here.
        // Previously a failed Mongo connection killed the entire Express
        // process a few seconds after startup — the server would appear to
        // be running, then die silently, and every request (including
        // signup/login) would fail in the browser with "Failed to fetch"
        // because nothing was listening on the port anymore.
        //
        // Now the API server stays up even if Mongo is unreachable, so
        // requests get a real error response instead of a dead connection,
        // and the server will automatically pick back up once Mongo becomes
        // reachable (mongoose keeps retrying / buffers queries).
        console.error("❌ MongoDB Connection Failed:", error.message);
        console.error(
            "The API server will keep running, but any database-backed " +
            "requests (signup, login, tasks, events, etc.) will fail until " +
            "this is fixed. Common causes: your current IP address is not " +
            "whitelisted in MongoDB Atlas (Network Access), or the " +
            "MONGO_URI/credentials in backend/.env are wrong."
        );
    }
};

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected");
});

module.exports = connectDB;