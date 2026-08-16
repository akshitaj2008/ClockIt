import { useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="titlebar">
      <h1 onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
        Clock It
      </h1>

      {user && (
        <button
          type="button"
          onClick={() => {
            onLogout?.();
            navigate("/login");
          }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}
