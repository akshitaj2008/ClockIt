const mongoose = require("mongoose");

// readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
function isDbConnected() {
    return mongoose.connection.readyState === 1;
}

module.exports = { isDbConnected };
