const mongoose = require("mongoose");

const RETRY_DELAY_MS = 5000;

// Tries to connect to MongoDB. If the very first attempt fails (slow DNS,
// Atlas still waking up, IP not allowed yet...) it keeps retrying every few
// seconds instead of giving up forever. Mongoose only auto-reconnects AFTER a
// first successful connection, so without this loop a single failed attempt
// at startup would leave the app on the temporary in-memory store until the
// server was restarted by hand.
const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error(
            "❌ MONGO_URI is not set. Add it to backend/.env (or your " +
            "host's environment variables). The app will run on the " +
            "temporary in-memory store only."
        );
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        console.error(
            `Retrying in ${RETRY_DELAY_MS / 1000}s. Common causes: your ` +
            "current IP address is not whitelisted in MongoDB Atlas " +
            "(Network Access), or the MONGO_URI/credentials are wrong."
        );

        setTimeout(connectDB, RETRY_DELAY_MS);
    }
};

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected");
});

module.exports = connectDB;