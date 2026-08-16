import TodoItem from "./TodoItem.jsx";

export default function TodoList({
  tasks,
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
    <ul>
      {tasks.map((task) => (
        <TodoItem
          key={task._id}
          task={task}
          handleDeleteTask={handleDeleteTask}
          handleToggleComplete={handleToggleComplete}
          editingIndex={editingIndex}
          editText={editText}
          setEditText={setEditText}
          handleStartEdit={handleStartEdit}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
        />
      ))}
    </ul>
  );
}