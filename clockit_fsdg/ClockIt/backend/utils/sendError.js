// Turns a caught error into a sensible HTTP response:
// bad input (validation failure, malformed id) -> 400, anything else -> 500.
function sendError(res, error) {
    const isBadInput =
        error && (error.name === "ValidationError" || error.name === "CastError");

    res.status(isBadInput ? 400 : 500).json({
        message: isBadInput ? "Invalid data was sent" : (error && error.message) || "Server error",
        ...(isBadInput && error.message ? { details: error.message } : {}),
    });
}

module.exports = sendError;
