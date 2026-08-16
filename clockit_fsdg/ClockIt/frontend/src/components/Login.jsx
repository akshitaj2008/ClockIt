import { useState } from "react";
import { loginUser } from "../services/authApi.js";
import "./todo/todo.css";

export default function Login({ onLogin , onSignup}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);    
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (error) {
      setError(error.message);
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

        <button type="submit">
          Login
        </button>
      </form>

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