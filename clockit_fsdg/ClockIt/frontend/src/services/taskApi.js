import { API_BASE_URL } from "../config.js";

const API_URL = `${API_BASE_URL}/api/tasks`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getTasks = async (search = "", priority = "") => {
  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (priority) {
    params.append("priority", priority);
  }

  const response = await fetch(
    `${API_URL}?${params.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
};

export const createTask = async (taskData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to create task");
  }

  return response.json();
};

export const updateTask = async (id, updates) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to update task");
  }

  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to delete task");
  }

  return response.json();
};

export const deleteCompletedTasks = async () => {
  const response = await fetch(`${API_URL}/completed`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(
      data.message || "Failed to delete completed tasks"
    );
  }

  return response.json();
};

export const deleteOverdueTasks = async () => {
  const response = await fetch(`${API_URL}/overdue`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(
      data.message || "Failed to delete overdue tasks"
    );
  }

  return response.json();
};