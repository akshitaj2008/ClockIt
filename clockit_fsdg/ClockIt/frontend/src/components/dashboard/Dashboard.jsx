import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import "./Dashboard.css";

function Dashboard({ user, onLogout }) {
    const navigate = useNavigate();

    const dashboardCards = [
        {
            title: "Calendar",
            description: "View your schedule, classes and events.",
            icon: "📅",
            path: "/calendar",
        },
        {
            title: "Attendance",
            description: "Track your attendance across all subjects.",
            icon: "📊",
            path: "/attendance",
        },
        {
            title: "To-Do",
            description: "Manage your tasks and stay organised.",
            icon: "✓",
            path: "/todo",
        },
        {
            title: "Study Timer",
            description: "Focus on your studies with timed sessions.",
            icon: "⏱️",
            path: "/timer",
        },
    ];

    return (
        <div className="dashboard">

            <Navbar user={user} onLogout={onLogout} />

            <header className="dashboard-header">
                <h1>ClockIt</h1>

                <p>
                    Organise your time. Stay on track.
                </p>
            </header>


            <main className="dashboard-content">

                <h2>Dashboard</h2>

                <p className="dashboard-subtitle">
                    What would you like to do today?
                </p>


                <div className="dashboard-grid">

                    {dashboardCards.map((card) => (

                        <div
                            key={card.title}
                            className="dashboard-card"
                            onClick={() => navigate(card.path)}
                        >

                            <div className="dashboard-card-icon">
                                {card.icon}
                            </div>

                            <div className="dashboard-card-content">

                                <h3>
                                    {card.title}
                                </h3>

                                <p>
                                    {card.description}
                                </p>

                            </div>

                            <span className="dashboard-card-arrow">
                                →
                            </span>

                        </div>

                    ))}

                </div>

            </main>

        </div>
    );
}

export default Dashboard;