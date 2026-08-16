import { useState } from "react";
import "./eventForm.css";

function EventForm({
    categories,
    onSave,
    onClose,
    onAddCategory
}) {
    // Event information
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Recurring event
    const [repeatWeekly, setRepeatWeekly] = useState(false);
    const [repeatUntil, setRepeatUntil] = useState("");

    // New category
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState("#3788d8");

    // Find weekday
    function getDayOfWeek(dateString) {
        const [year, month, day] = dateString
            .split("-")
            .map(Number);

        const date = new Date(
            year,
            month - 1,
            day
        );

        return date.getDay();
    }

    // Get day after repeat date
    function getNextDay(dateString) {
        const [year, month, day] = dateString
            .split("-")
            .map(Number);

        const date = new Date(
            year,
            month - 1,
            day
        );

        date.setDate(date.getDate() + 1);

        const nextYear = date.getFullYear();
        const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
        const nextDay = String(date.getDate()).padStart(2, "0");

        return `${nextYear}-${nextMonth}-${nextDay}`;
    }

    // Create a new category
    async function handleCreateCategory() {
        if (newCategoryName.trim() === "") {
            return;
        }

        const newCategory = {
            name: newCategoryName.trim(),
            color: newCategoryColor
        };

        // Send category to CalendarView, which saves it to the backend
        // and hands back the persisted version (with its real color).
        const savedCategory = await onAddCategory(newCategory);

        // Automatically select the new category
        setCategory((savedCategory || newCategory).name);

        // Reset category form
        setNewCategoryName("");
        setNewCategoryColor("#3788d8");
        setShowCategoryForm(false);
    }

    // Colour swatch shown next to the category dropdown, so the picked
    // category's colour is visible before the event is even saved.
    const selectedCategory = categories.find(
        (cat) => cat.name === category
    );

    const previewColor = selectedCategory
        ? selectedCategory.color
        : "#808080";

    // Save event
    function handleSubmit(e) {
        e.preventDefault();

        // Use the already-computed category colour if a category is
        // selected. Otherwise use default grey.
        const eventColor = previewColor;

         const newEvent = {
                title: title.trim(),

                category: category || "Uncategorized",

                date: date,

                startTime: startTime,

                endTime: endTime,

                recurring: repeatWeekly,

                repeatUntil:
                    repeatWeekly && repeatUntil
                        ? repeatUntil
                        : null,

                color: eventColor
            };

            console.log("Event being sent to backend:", newEvent);

            onSave(newEvent);
        }
    

    return (
        <div className="modal-overlay">

            <div className="modal">

                {/* Modal Header */}
                <div className="modal-header">

                    <h2>Add Event</h2>

                    <button
                        className="close-btn"
                        type="button"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>

                {/* Event Form */}
                <form onSubmit={handleSubmit}>

                    {/* Event Title */}
                    <div className="form-group">

                        <label>
                            Event Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="Enter event title"
                            required
                        />

                    </div>

                    {/* Category */}
                    <div className="form-group">

                        <label>
                            Category
                        </label>

                        <div className="category-row">

                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(e.target.value)
                                }
                            >

                                <option value="">
                                    Uncategorized
                                </option>

                                {categories.map((cat) => (
                                    <option
                                        key={cat.name}
                                        value={cat.name}
                                    >
                                        {cat.name}
                                    </option>
                                ))}

                            </select>

                            <span
                                className="category-color-preview"
                                style={{ backgroundColor: previewColor }}
                                title={category || "Uncategorized"}
                            />

                        </div>

                        {/* Create Category Button */}
                        <button
                            type="button"
                            className="new-category-btn"
                            onClick={() =>
                                setShowCategoryForm(
                                    !showCategoryForm
                                )
                            }
                        >
                            Create New Category
                        </button>

                        {/* New Category Form */}
                        {showCategoryForm && (
                            <div className="new-category-section">

                                <label>
                                    Category Name
                                </label>

                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) =>
                                        setNewCategoryName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="e.g. Classes"
                                />

                                <label>
                                    Category Colour
                                </label>

                                <input
                                    type="color"
                                    value={newCategoryColor}
                                    onChange={(e) =>
                                        setNewCategoryColor(
                                            e.target.value
                                        )
                                    }
                                />

                                <button
                                    className="add-category-btn"
                                    type="button"
                                    onClick={handleCreateCategory}
                                >
                                    Add Category
                                </button>

                            </div>
                        )}

                    </div>

                    {/* Date */}
                    <div className="form-group">

                        <label>
                            Date
                        </label>

                        <input
                            type="date"
                            value={date}
                            onChange={(e) =>
                                setDate(e.target.value)
                            }
                            required
                        />

                    </div>

                    {/* Start Time */}
                    <div className="form-group">

                        <label>
                            Start Time
                        </label>

                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) =>
                                setStartTime(e.target.value)
                            }
                            required
                        />

                    </div>

                    {/* End Time */}
                    <div className="form-group">

                        <label>
                            End Time
                        </label>

                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) =>
                                setEndTime(e.target.value)
                            }
                            required
                        />

                    </div>

                    {/* Recurring Event */}
                    <div className="form-group">

                        <label className="repeat-label">

                            <input
                                type="checkbox"
                                checked={repeatWeekly}
                                onChange={(e) =>
                                    setRepeatWeekly(
                                        e.target.checked
                                    )
                                }
                            />

                            Repeat every week

                        </label>

                        {/* Repeat Until */}
                        {repeatWeekly && (
                            <div className="repeat-section">

                                <label>
                                    Repeat Until
                                </label>

                                <input
                                    type="date"
                                    value={repeatUntil}
                                    onChange={(e) =>
                                        setRepeatUntil(
                                            e.target.value
                                        )
                                    }
                                />

                                <small>
                                    Leave empty to repeat indefinitely.
                                </small>

                            </div>
                        )}

                    </div>

                    {/* Buttons */}
                    <div className="form-group">

                        <div className="modal-actions">

                            <button
                                className="cancel-btn"
                                type="button"
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-btn"
                            >
                                Save Event
                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EventForm;