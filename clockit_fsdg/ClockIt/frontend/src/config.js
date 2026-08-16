// Central place for the backend API base URL.
// Override by setting VITE_API_BASE_URL in a .env file (see .env.example)
// when deploying somewhere other than localhost.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
