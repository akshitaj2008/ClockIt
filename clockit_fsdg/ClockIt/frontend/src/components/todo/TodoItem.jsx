// The server stores a deadline as midnight UTC of the chosen day
// (e.g. "2026-11-10T00:00:00.000Z"). Reading it with new Date() and then
// using local time would show the PREVIOUS day for users west of UTC, so we
// take just the YYYY-MM-DD part and build a local date from it.
function parseDeadline(deadline) {
  const [year, month, day] = String(deadline).slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getDeadlineText(deadline) {
  if (!deadline) {
    return "No deadline";
  }

  const today = new Date();
  const dueDate = parseDeadline(deadline);

  // Remove time from today's date (dueDate is already at midnight)
  today.setHours(0, 0, 0, 0);

  const difference = dueDate - today;
  const days = Math.round(difference / (1000 * 60 * 60 * 24));

  if (days < 0) {
    const overdueDays = Math.abs(days);

    return overdueDays === 1
      ? "Overdue by 1 day"
      : `Overdue by ${overdueDays} days`;
  }

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "Due tomorrow";
  }

  return `Due in ${days} days`;
}

export default function TodoItem({
  task,
  handleDeleteTask,
  handleToggleComplete,
  editingIndex,
  editText,
  setEditText,
  handleStartEdit,
  handleSaveEdit,
  handleCancelEdit,
}) {
  return (
    <li>

      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => handleToggleComplete(task._id)}
      />

      {task._id === editingIndex ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />

          <button onClick={handleSaveEdit}>
            Save
          </button>

          <button onClick={handleCancelEdit}>
            Cancel
          </button>
        </>
      ) : (
        <>
        <div className="task-content">
          <span
            style={{
              textDecoration: task.completed
                ? "line-through"
                : "none",
            }}
          >
            {task.text}
          </span>

          <div className="task-details">
            <span className={`priority-${task.priority || "low"}`}>
            {task.priority || "low"}
            </span>

            <span>
            {task.deadline
              ? `${parseDeadline(task.deadline).toLocaleDateString()} • ${getDeadlineText(task.deadline)}`
              : "No deadline"}
            </span>
          </div>
        </div>

          <div className="task-actions">

            <button
              className="edit-button"
              onClick={() => handleStartEdit(task._id)}
              title="Edit task"
            >
              ✏️
            </button>

            <button
              className="delete-button"
              onClick={() => handleDeleteTask(task._id)}
              title="Delete task"
            >
              🗑️
            </button>

          </div>
        </>
      )}

    </li>
  );
}