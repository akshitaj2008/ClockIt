import { useState } from "react";
import { registerUser } from "../services/authApi.js";
import "./todo/todo.css";

export default function Signup({ onSignupSuccess, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await registerUser(name, email, password);

      onSignupSuccess();
    } catch (error) {
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

      <h2>Sign Up</h2>

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {error && (
        <p className="login-error">
          {error}
        </p>
      )}

      <p>
        Already have an account?{" "}
        <button type="button" onClick={onLogin}>
          Login
        </button>
      </p>
    </div>
  );
}