import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate,
} from "react-router-dom";

// Main sections
import Dashboard from "./components/dashboard/Dashboard.jsx";
import CalendarView from "./components/calendar/calendarView.jsx";
import Attendance from "./components/attendance/Attendance.jsx";
import Todo from "./components/todo/Todo.jsx";
import StudyTimer from "./components/Timer/Timer.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";

// Reads whatever the auth flow last stored, so a refresh keeps the session.
function getStoredUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function LoginPage({ onLogin }) {
    const navigate = useNavigate();

    return (
        <Login
            onLogin={(user) => {
                onLogin(user);
                navigate("/dashboard");
            }}
            onSignup={() => navigate("/signup")}
        />
    );
}

function SignupPage() {
    const navigate = useNavigate();

    return (
        <Signup
            onSignupSuccess={() => navigate("/login")}
            onLogin={() => navigate("/login")}
        />
    );
}

// Every feature route needs a logged-in user, so all of them are gated
// behind login. Signup/login is now the entry point of the app.
function ProtectedRoute({ user, children }) {
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function App() {
    const [user, setUser] = useState(getStoredUser());

    function handleLogin(loggedInUser) {
        setUser(loggedInUser);
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Authentication */}
                <Route
                    path="/login"
                    element={<LoginPage onLogin={handleLogin} />}
                />

                <Route path="/signup" element={<SignupPage />} />

                {/* Entry point: logged-in users land on the dashboard,
                    everyone else is sent to login first. */}
                <Route
                    path="/"
                    element={
                        <Navigate to={user ? "/dashboard" : "/login"} replace />
                    }
                />

                {/* Dashboard (requires login) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute user={user}>
                            <Dashboard user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* Calendar (requires login) */}
                <Route
                    path="/calendar"
                    element={
                        <ProtectedRoute user={user}>
                            <CalendarView user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* Attendance (requires login) */}
                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute user={user}>
                            <Attendance user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* To-do (requires login) */}
                <Route
                    path="/todo"
                    element={
                        <ProtectedRoute user={user}>
                            <Todo user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* Study Timer (requires login) */}
                <Route
                    path="/timer"
                    element={
                        <ProtectedRoute user={user}>
                            <StudyTimer user={user} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* Anything unmatched falls back to the entry point logic */}
                <Route
                    path="*"
                    element={
                        <Navigate to={user ? "/dashboard" : "/login"} replace />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
