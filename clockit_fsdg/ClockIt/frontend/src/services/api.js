import axios from "axios";
import { API_BASE_URL } from "../config.js";
import { handleAuthFailure } from "./session.js";

const API = axios.create({
    baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server rejects our login (expired / invalid token), go back to login.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    handleAuthFailure(error.response?.status);
    return Promise.reject(error);
  }
);

export default API;
