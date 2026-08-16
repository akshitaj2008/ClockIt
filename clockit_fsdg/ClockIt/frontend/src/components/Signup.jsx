import { useState } from "react";
import { registerUser } from "../services/authApi.js";
import "./todo/todo.css";

export default function Signup({ onSignupSuccess, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();

    setError("");

    try {
      await registerUser(name, email, password);

      onSignupSuccess();
    } catch (error) {
      setError(error.message);
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Create Account
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