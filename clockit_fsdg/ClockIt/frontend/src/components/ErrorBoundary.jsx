import { Component } from "react";

// If any screen throws while rendering, show a friendly message with a way
// out instead of a blank white page.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Screen crashed:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          maxWidth: 420,
          margin: "15vh auto",
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2>Something went wrong</h2>
        <p>Sorry about that. Reloading usually fixes it.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload page
        </button>{" "}
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.assign("/login");
          }}
        >
          Back to login
        </button>
      </div>
    );
  }
}
