import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../Navbar.jsx";
import "./Attendance.css";

function Attendance({ user, onLogout }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchAttendance();
    }, []);

    async function fetchAttendance() {
        try {
            setLoading(true);

            const response = await API.get(
                "/events/attendance/percentage"
            );

            setCategories(response.data);

        } catch (error) {
            console.error(
                "Error fetching attendance:",
                error
            );

            setError(
                "Unable to load attendance data."
            );

        } finally {
            setLoading(false);
        }
    }

    // Overall statistics
    const overall = categories.reduce(
        (result, category) => {
            result.present += category.present || 0;
            result.absent += category.absent || 0;
            result.cancelled += category.cancelled || 0;

            return result;
        },
        {
            present: 0,
            absent: 0,
            cancelled: 0
        }
    );

    const totalClasses =
        overall.present + overall.absent;

    const overallPercentage =
        totalClasses === 0
            ? 0
            : (
                (overall.present / totalClasses) *
                100
            ).toFixed(1);

    if (loading) {
        return (
            <div className="attendance-page">
                <Navbar user={user} onLogout={onLogout} />
                <div className="attendance-loading">
                    Loading attendance...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="attendance-page">
                <Navbar user={user} onLogout={onLogout} />
                <div className="attendance-error">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="attendance-page">

            <Navbar user={user} onLogout={onLogout} />

            {/* Header */}
            <div className="attendance-header">
                <div>
                    <h1>Attendance</h1>

                    <p>
                        Track your attendance across
                        all your subjects.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>
            </div>


            {/* Overall Attendance */}
            <section className="overall-section">

                <div className="overall-card">

                    <div className="overall-left">

                        <p className="section-label">
                            Overall Attendance
                        </p>

                        <h2>
                            {overallPercentage}%
                        </h2>

                        <p className="attendance-subtext">
                            Based on {totalClasses} classes
                        </p>

                    </div>

                    <div className="overall-stats">

                        <div className="stat-item">
                            <span className="stat-dot present-dot"></span>

                            <div>
                                <strong>
                                    {overall.present}
                                </strong>

                                <span>
                                    Present
                                </span>
                            </div>
                        </div>


                        <div className="stat-item">
                            <span className="stat-dot absent-dot"></span>

                            <div>
                                <strong>
                                    {overall.absent}
                                </strong>

                                <span>
                                    Absent
                                </span>
                            </div>
                        </div>


                        <div className="stat-item">
                            <span className="stat-dot cancelled-dot"></span>

                            <div>
                                <strong>
                                    {overall.cancelled}
                                </strong>

                                <span>
                                    Cancelled
                                </span>
                            </div>
                        </div>

                    </div>

                </div>

            </section>


            {/* Subject / Category Attendance */}
            <section className="category-section">

                <div className="section-heading">

                    <div>
                        <h2>Attendance by Subject</h2>

                        <p>
                            View your attendance for each
                            category.
                        </p>
                    </div>

                </div>


                {categories.length === 0 ? (

                    <div className="empty-attendance">
                        <h3>No attendance records yet</h3>

                        <p>
                            Mark attendance for your classes
                            to see statistics here.
                        </p>
                    </div>

                ) : (

                    <div className="category-grid">

                        {categories.map((item) => (

                            <div
                                className="category-card"
                                key={item.category}
                            >

                                <div className="category-card-header">

                                    <div>
                                        <h3>
                                            {item.category}
                                        </h3>

                                        <p>
                                            {(
                                                (item.present || 0) +
                                                (item.absent || 0)
                                            )} classes
                                        </p>
                                    </div>

                                    <div
                                        className={
                                            `category-percentage ${
                                                item.percentage >= 75
                                                    ? "good"
                                                    : "low"
                                            }`
                                        }
                                    >
                                        {item.percentage}%
                                    </div>

                                </div>


                                {/* Progress bar */}

                                <div className="progress-container">

                                    <div
                                        className={
                                            `progress-bar ${
                                                item.percentage >= 75
                                                    ? "good"
                                                    : "low"
                                            }`
                                        }
                                        style={{
                                            width: `${Math.min(
                                                item.percentage,
                                                100
                                            )}%`
                                        }}
                                    />

                                </div>


                                {/* Statistics */}

                                <div className="category-stats">

                                    <div>
                                        <span className="stat-label">
                                            Present
                                        </span>

                                        <strong>
                                            {item.present || 0}
                                        </strong>
                                    </div>


                                    <div>
                                        <span className="stat-label">
                                            Absent
                                        </span>

                                        <strong>
                                            {item.absent || 0}
                                        </strong>
                                    </div>


                                    <div>
                                        <span className="stat-label">
                                            Cancelled
                                        </span>

                                        <strong>
                                            {item.cancelled || 0}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default Attendance;