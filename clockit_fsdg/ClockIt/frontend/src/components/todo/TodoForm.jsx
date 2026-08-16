export default function TodoForm({ newTask, setNewTask,  priority,  setPriority,  deadline,  setDeadline, handleAddTask}) {
  return (
    <div className="todo-form">
      <input
        type="text"
        placeholder="Enter your task"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      

      <button onClick={handleAddTask}>Add Task</button>
    </div>
  );
}