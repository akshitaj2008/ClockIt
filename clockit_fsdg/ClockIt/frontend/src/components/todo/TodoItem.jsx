function getDeadlineText(deadline) {
  if (!deadline) {
    return "No deadline";
  }

  const today = new Date();
  const dueDate = new Date(deadline);

  // Remove time from both dates
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

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
              ? `${new Date(task.deadline).toLocaleDateString()} • ${getDeadlineText(task.deadline)}`
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