import { useState } from "react";
import { loginUser } from "../services/authApi.js";
import "./todo/todo.css";

export default function Login({ onLogin, onSignup, notice }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);    
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (error) {
      // "Failed to fetch" = the server could not be reached at all.
      setError(
        error.message === "Failed to fetch"
          ? "Can't reach the server. Please check your connection and try again."
          : error.message
      );
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h1>Clock It</h1>

      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {loading && (
        <p>
          Please wait - the server can take up to a minute to wake up.
        </p>
      )}

      {notice && !error && <p style={{ color: "#2e7d32" }}>{notice}</p>}

      {error && (
        <p className="login-error">
        {error}
        </p>
      )}

      <p>
       Don't have an account?{" "}
       <button type="button" onClick={onSignup}>
         Sign Up
       </button>
      </p>
    </div>
  );
}