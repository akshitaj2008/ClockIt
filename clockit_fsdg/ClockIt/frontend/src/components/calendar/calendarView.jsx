import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../services/api.js";
import EventForm from "./eventForm.jsx";
import './calendarView.css';
import EventDetails from "./eventDetails.jsx";
import Navbar from "../Navbar.jsx";

function CalendarView({ user, onLogout }) {

    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
        fetchCategories();
    }, []);

    async function fetchEvents() {
        try {
            const response = await API.get("/events");

            const formattedEvents =
                response.data.map(convertBackendEvent);

            setEvents(formattedEvents);

        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }

    // Categories are persisted on the backend (shared with the Study
    // Timer's subjects) so they survive refreshes and are ready as soon
    // as the calendar loads - not just for the current session.
    async function fetchCategories() {
        try {
            const response = await API.get("/api/subjects");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    function convertBackendEvent(event) {
        const color = event.color || "#839958";

        // Normal event
        if (!event.recurring) {
            return {
                id: event._id,
                title: event.title,
                start: `${event.date}T${event.startTime}`,
                end: `${event.date}T${event.endTime}`,

                backgroundColor: color,
                borderColor: color,

                extendedProps: {
                    category: event.category,
                    attendance: event.attendance,
                    recurring: false,
                    backendEvent: event
                }
            };
        }

        // Recurring event
        const dayMap = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6
        };

        return {
            id: event._id,
            title: event.title,

            daysOfWeek: [dayMap[event.day]],

            startTime: event.startTime,
            endTime: event.endTime,

            startRecur: event.date,

            endRecur: event.repeatUntil
                ? getNextDay(event.repeatUntil)
                : undefined,

            backgroundColor: color,
            borderColor: color,

            extendedProps: {
                category: event.category,
                attendance: event.attendance,
                recurring: true,
                backendEvent: event
            }
        };
    }

    function getNextDay(dateString) {
        const date = new Date(`${dateString}T00:00:00`);

        date.setDate(date.getDate() + 1);

        return date.toISOString().split("T")[0];
    }

    async function handleAddEvent(eventData) {
        try {
            console.log("Sending event to backend:", eventData);

            const response = await API.post(
                "/events",
                eventData
            );

            console.log("Backend response:", response.data);

            const savedEvent = convertBackendEvent(response.data);

            setEvents((prev) => [
                ...prev,
                savedEvent
            ]);

            setShowModal(false);

        } catch (error) {
            console.error("FULL ERROR:", error);

            console.error(
                "Error message:",
                error.message
            );

            console.error(
                "Error response:",
                error.response
            );

            console.error(
                "Backend error data:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Could not save event."
            );
        }
    }

    // Persist the new category/subject to the backend so it survives a
    // refresh and shows up for every event, then return the saved version
    // (with its real id) so the form can select it straight away.
    async function handleAddCategory(newCategory) {
        try {
            const response = await API.post(
                "/api/subjects",
                newCategory
            );

            const savedCategory = response.data;

            setCategories((prev) => [...prev, savedCategory]);

            return savedCategory;
        } catch (error) {
            console.error("Error creating category:", error);

            alert(
                error.response?.data?.message ||
                error.message ||
                "Could not create category."
            );

            return null;
        }
    }

    function handleEventClick(info) {
        setSelectedEvent(info.event);
    }

    async function handleDeleteEvent(event) {
        try {
            await API.delete(`/events/${event.id}`);

            setEvents((prev) =>
                prev.filter((item) => item.id !== event.id)
            );

            setSelectedEvent(null);
        } catch (error) {
            console.error("Error deleting event:", error);
            alert(
                error.response?.data?.message ||
                error.message ||
                "Could not delete event."
            );
        }
    }


    return (
        <div className="calendar-page">

            <Navbar user={user} onLogout={onLogout} />

            <div className='page-header'>
                 <h1>ClockIt</h1>
                <div className="calendar-actions">

                    <button
                        className="add-event-btn"
                        onClick={() => setShowModal(true)}
                    >
                        Add Event
                    </button>

                    <button
                        className="attendance-btn"
                        onClick={() => navigate("/attendance")}
                    >
                        Attendance
                    </button>

                    <button
                        className="attendance-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>

                </div>
            </div>

            {categories.length > 0 && (
                <div className="category-legend">
                    {categories.map((cat) => (
                        <span className="category-chip" key={cat._id || cat.name}>
                            <span
                                className="category-dot"
                                style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                        </span>
                    ))}
                </div>
            )}

                <FullCalendar
                    plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin
                    ]}
                    initialView="timeGridWeek"
                    events={events}
                    eventClick={handleEventClick}

                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay"
                    }}
                />

                {showModal && (
                    <EventForm
                        categories={categories}
                        onSave={handleAddEvent}
                        onClose={() => setShowModal(false)}
                        onAddCategory={handleAddCategory}
                    />
                )}

                {selectedEvent && (
                    <EventDetails
                        event={selectedEvent}

                        onClose={() =>
                            setSelectedEvent(null)
                        }

                        onEdit={() => {
                            alert("Editing events is coming soon.");
                        }}

                        onDelete={handleDeleteEvent}
                    />
                )}

        </div>
    );
}

export default CalendarView;