import { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask, deleteCompletedTasks, deleteOverdueTasks } from "../../services/taskApi.js";

import Navbar from "../Navbar.jsx";
import TodoForm from "./TodoForm.jsx";
import TodoList from "./TodoList.jsx";
import './todo.css';


export default function Todo({ user, onLogout }) {

 
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const [editText, setEditText] = useState("");
  const [priority, setPriority] = useState("low");
  const [deadline, setDeadline] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks(search, priorityFilter);
        setTasks(data);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      }
    };

    loadTasks();
  }, [search, priorityFilter]);


  async function handleAddTask() {
    

    if (newTask.trim() === "") {
      console.log("TASK IS EMPTY");
      return;
    }

    try {
      const createdTask = await createTask({
        text: newTask,
        completed: false,
        priority: priority,
        deadline: deadline || null
      });

      const data = await getTasks(search, priorityFilter);

     
      setTasks(data);

      setNewTask("");
      setPriority("low");
      setDeadline("");
    } catch (error) {
      console.error("ADD TASK ERROR:", error);
    }
  }
  function handleStartEdit(taskId) {
    const task = tasks.find((task) => task._id === taskId);

    if (!task) {
      return;
    }

    setEditingIndex(taskId);
    setEditText(task.text);
  }

  async function handleSaveEdit() {
    if (editText.trim() === "") {
      return;
    }

    try {
      const updatedTask = await updateTask(editingIndex, {
        text: editText,
      });

      setTasks(
        tasks.map((task) =>
          task._id === editingIndex ? updatedTask : task
        )
      );

      setEditingIndex(null);
      setEditText("");
    } catch (error) {
      console.error("Failed to save edit:", error);
    }
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditText("");
  }


  async function handleDeleteTask(taskId) {
    try {
      await deleteTask(taskId);

      setTasks(
        tasks.filter((task) => task._id !== taskId)
      );
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }

  async function handleDeleteCompletedTasks() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all completed tasks?"
    );

    if (!confirmed) return;

    try {
      await deleteCompletedTasks();

      const data = await getTasks(search, priorityFilter);
      console.log("TASKS AFTER ADD:", data);
      setTasks(data);

    } catch (error) {
      console.error("Failed to delete completed tasks:", error);
    }
  }


  async function handleDeleteOverdueTasks() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all overdue tasks?"
    );

    if (!confirmed) return;

    try {
      await deleteOverdueTasks();

      const data = await getTasks(search, priorityFilter);

      console.log("TASKS AFTER ADD:", data);

      setTasks(data);
    } catch (error) {
      console.error("Failed to delete overdue tasks:", error);
    }
  }

  async function handleToggleComplete(taskId) {
    const task = tasks.find((task) => task._id === taskId);

    if (!task) {
      return;
    }

    try {
      const updatedTask = await updateTask(taskId, {
        completed: !task.completed,
      });

      setTasks(
        tasks.map((task) =>
          task._id === taskId ? updatedTask : task
        )
      );
    } catch (error) {
      console.error("Failed to update task: ", error);
    }
  }



  const pendingTasks = tasks.filter((task) => !task.completed);

  const completedTasks = tasks.filter((task) => task.completed);

  const completedCount = completedTasks.length;
  const totalCount = tasks.length;

  
  return (
    <div className="app">

      <Navbar user={user} onLogout={onLogout} />

      <p className="titlebar">
        Completed: {completedCount} / {totalCount}
      </p>

      <input className="search-box"
        type="text"
        placeholder="Search task"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="priority-filter"
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
      >
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <TodoForm
        newTask={newTask}
        setNewTask={setNewTask}
        priority={priority}
        setPriority={setPriority}
        deadline={deadline}
        setDeadline={setDeadline}
        handleAddTask={handleAddTask}
      />



      <div className="pending-header">
        <h2>🌱 Pending Tasks</h2>

        <button
          className="delete-all-button"
          onClick={handleDeleteOverdueTasks}
        >
          ⏰ Delete Overdue
        </button>
      </div>

      <TodoList
        tasks={pendingTasks}
        handleDeleteTask={handleDeleteTask}
        handleToggleComplete={handleToggleComplete}
        editingIndex={editingIndex}
        editText={editText}
        setEditText={setEditText}
        handleStartEdit={handleStartEdit}
        handleSaveEdit={handleSaveEdit}
        handleCancelEdit={handleCancelEdit}
      />

      <hr />

      <button
        className="completed-toggle"
        onClick={() => setShowCompleted(!showCompleted)}
      >
        {showCompleted ? "Hide Completed Tasks" : "View Completed Tasks"}
      </button>

      {showCompleted && (
        <>
          <div className="completed-header">
            <h2>🌾 Completed Tasks</h2>

            <button
              className="delete-all-button"
              onClick={handleDeleteCompletedTasks}
            >
              🗑️ Delete All
            </button>
          </div>

          <TodoList
            tasks={completedTasks}
            handleDeleteTask={handleDeleteTask}
            handleToggleComplete={handleToggleComplete}
            editingIndex={editingIndex}
            editText={editText}
            setEditText={setEditText}
            handleStartEdit={handleStartEdit}
            handleSaveEdit={handleSaveEdit}
            handleCancelEdit={handleCancelEdit}
          />

        </>
      )}



    </div>
  );
}
