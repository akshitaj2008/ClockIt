const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    deleteCompletedTasks,
    deleteOverdueTasks,
} = require("../controllers/taskController");

// All task routes require a logged-in user
router.use(authenticateToken);

// Specific routes must come before the /:id route below,
// otherwise Express would treat "completed"/"overdue" as an :id.
router.delete("/completed", deleteCompletedTasks);
router.delete("/overdue", deleteOverdueTasks);

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
