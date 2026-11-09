import { useState } from "react";
import { createPortal } from "react-dom";

import "./eventDetails.css";
import API from "../../services/api.js";


function EventDetails({
    event,
    onClose,
    onEdit,
    onDelete,
    onAttendanceChange
}) {

    const [attendance, setAttendance] = useState(
        event.extendedProps?.attendance || null
    );

    const eventColor =
        event.backgroundColor ||
        event.extendedProps?.backendEvent?.color ||
        "#839958";

    async function handleAttendance(status) {
        try {

            const response = await API.patch(
                `/events/${event.id}`,
                {
                    attendance: status
                }
            );

            setAttendance(response.data.attendance);
            onAttendanceChange?.(event.id, response.data.attendance);

        } catch (error) {

            console.error(
                "Error updating attendance:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Could not update attendance. Please try again."
            );

        }
    } 

    const modal = (

        <div
            className="event-details-overlay"
            onClick={onClose}
        >

            <div
                className="event-details-modal"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}

                <div
                    className="event-details-header"
                    style={{ borderLeftColor: eventColor }}
                >

                    <h2>
                        <span
                            className="event-color-dot"
                            style={{ backgroundColor: eventColor }}
                        />
                        {event.title}
                    </h2>

                    <button
                        className="close-button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                {/* Event information */}

                <div className="event-info">

                    <p>
                        <strong>Category:</strong>{" "}
                        {event.extendedProps?.category ||
                            "Uncategorized"}
                    </p>

                    <p>
                        <strong>Start:</strong>{" "}
                        {event.start?.toLocaleString()}
                    </p>

                    {event.end && (
                        <p>
                            <strong>End:</strong>{" "}
                            {event.end.toLocaleString()}
                        </p>
                    )}

                    {event.extendedProps?.recurring && (
                        <p>
                            <strong>Repeats:</strong>{" "}
                            Every week
                        </p>
                    )}

                </div>


                {/* Attendance */}

                <div className="attendance-section">

                    <h3>
                        Attendance
                    </h3>

                    <div className="attendance-buttons">

                        <button
                            className={
                                attendance === "Present"
                                    ? "attendance-active"
                                    : ""
                            }
                            onClick={() =>
                                handleAttendance("Present")
                            }
                        >
                            Present
                        </button>


                        <button
                            className={
                                attendance === "Absent"
                                    ? "attendance-active"
                                    : ""
                            }
                            onClick={() =>
                                handleAttendance("Absent")
                            }
                        >
                            Absent
                        </button>


                        <button
                            className={
                                attendance === "Cancelled"
                                    ? "attendance-active"
                                    : ""
                            }
                            onClick={() =>
                                handleAttendance("Cancelled")
                            }
                        >
                            Cancelled
                        </button>

                    </div>

                </div>


                {/* Actions */}

                <div className="event-actions">

                    {onEdit && (
                        <button
                            className="edit-event-button"
                            onClick={() => onEdit(event)}
                        >
                            Edit Event
                        </button>
                    )}


                    <button
                        className="delete-event-button"
                        onClick={() => onDelete(event)}
                    >
                        Delete Event
                    </button>

                </div>

            </div>

        </div>
    );


    // Render the modal directly into <body>
    return createPortal(
        modal,
        document.body
    );
}


export default EventDetails;