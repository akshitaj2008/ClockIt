// In-memory fallback data store.
//
// This is ONLY used while MongoDB is unreachable (see dbStatus.js), so that
// the app is still usable for development/testing without a working
// database connection. Data here lives only as long as the server process
// is running — it resets on restart and is never written to disk.
//
// Once MONGO_URI is fixed and the real database connects, all the
// controllers switch back to using Mongoose/MongoDB automatically; nothing
// stored here migrates over.

const crypto = require("crypto");

function makeId() {
    // 24 hex chars, so it looks and behaves like a Mongo ObjectId string
    // anywhere the frontend expects one.
    return crypto.randomBytes(12).toString("hex");
}

function createCollection() {
    let items = [];

    return {
        all() {
            return items;
        },
        find(predicate) {
            return predicate ? items.filter(predicate) : [...items];
        },
        findOne(predicate) {
            return items.find(predicate) || null;
        },
        findById(id) {
            return items.find((item) => item._id === id) || null;
        },
        insert(data) {
            const now = new Date();
            const doc = {
                _id: makeId(),
                createdAt: now,
                updatedAt: now,
                ...data,
            };
            items.push(doc);
            return doc;
        },
        updateById(id, updates) {
            const doc = this.findById(id);
            if (!doc) return null;
            Object.assign(doc, updates, { updatedAt: new Date() });
            return doc;
        },
        deleteById(id) {
            const before = items.length;
            items = items.filter((item) => item._id !== id);
            return items.length < before;
        },
        deleteWhere(predicate) {
            const removed = items.filter(predicate);
            items = items.filter((item) => !predicate(item));
            return removed;
        },
    };
}

module.exports = {
    users: createCollection(),
    tasks: createCollection(),
    events: createCollection(),
    subjects: createCollection(),
    sessions: createCollection(),
};
