
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./AITripPlanner.css";

const API_URL = "http://localhost:5000/api/ai/plan";
const TRIPS_API_URL = "http://localhost:5000/api/trips";

function AITripPlanner() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState([]);
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  const interestOptions = [
    "Mountains",
    "Nature",
    "Adventure",
    "Beaches",
    "History",
    "Local food",
    "Shopping",
    "Culture"
  ];

  const toggleInterest = (interest) => {
    setInterests((previous) =>
      previous.includes(interest)
        ? previous.filter((item) => item !== interest)
        : [...previous, interest]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaveMessage("");
    setItinerary("");

    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    if (!startDate || !endDate || endDate < startDate) {
      setError("Please select valid travel dates.");
      return;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const numberOfDays =
      Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1;

    if (numberOfDays > 15) {
      setError("Please select a trip of 15 days or less.");
      return;
    }

    if (!Number.isFinite(Number(budget)) || Number(budget) <= 0) {
      setError("Please enter a valid budget.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to generate your AI trip plan.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          destination: destination.trim(),
          startDate,
          endDate,
          budget: Number(budget),
          interests
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to generate your itinerary."
        );
      }

      setItinerary(data.itinerary);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    setError("");
    setSaveMessage("");

    if (!itinerary) {
      setError("Generate an itinerary before saving it.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to save your trip.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(TRIPS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          customLocation: {
            name: destination.trim(),
            displayName: destination.trim()
          },
          tripName: `${destination.trim()} AI Trip`,
          startDate,
          endDate,
          travellers: 1,
          notes: [
            `AI-generated travel plan`,
            `Budget: ₹${budget}`,
            `Interests: ${interests.length ? interests.join(", ") : "General sightseeing"}`,
            "",
            itinerary
          ].join("\n")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your trip.");
      }

      setSaveMessage("Itinerary saved successfully to My Trips.");
    } catch (err) {
      setError(err.message || "Failed to save itinerary. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewTrip = () => {
    setDestination("");
    setStartDate("");
    setEndDate("");
    setBudget("");
    setInterests([]);
    setItinerary("");
    setError("");
    setSaveMessage("");
  };

  return (
    <div className="ai-planner-page">
      <header className="ai-planner-header">
        <Link to="/" className="ai-back-link">
          ← Back to TripForge
        </Link>

        <p className="ai-eyebrow">YOUR PERSONAL TRAVEL ASSISTANT</p>
        <h1>AI Trip Planner</h1>
        <p className="ai-intro">
          Tell us what your next adventure looks like.
          Get a concise, day-wise itinerary tailored to your trip.
        </p>
      </header>

      <main className="ai-planner-layout">
        <section className="ai-planner-form-card">
          <h2>Plan your trip</h2>
          <p className="ai-card-description">
            Add your travel details to generate a personalized plan.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="ai-destination">Destination</label>
            <input
              id="ai-destination"
              type="text"
              placeholder="e.g. Manali, India"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              maxLength={150}
              required
            />

            <div className="ai-date-grid">
              <div>
                <label htmlFor="ai-start-date">Start date</label>
                <input
                  id="ai-start-date"
                  type="date"
                  value={startDate}
                  min={todayString}
                  onChange={(event) => {
                    const value = event.target.value;
                    setStartDate(value);

                    if (endDate && value && endDate < value) {
                      setEndDate("");
                    }
                  }}
                  required
                />
              </div>

              <div>
                <label htmlFor="ai-end-date">End date</label>
                <input
                  id="ai-end-date"
                  type="date"
                  value={endDate}
                  min={startDate || todayString}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                />
              </div>
            </div>

            <label htmlFor="ai-budget">Total budget (₹)</label>
            <input
              id="ai-budget"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 10000"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              required
            />

            <fieldset className="ai-interests">
              <legend>What are you interested in?</legend>
              <p>Select any that match your trip.</p>

              <div className="ai-interest-options">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={
                      interests.includes(interest)
                        ? "ai-interest active"
                        : "ai-interest"
                    }
                    aria-pressed={interests.includes(interest)}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && (
              <p className="ai-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="ai-generate-button"
              disabled={loading || saving}
            >
              {loading ? "Creating your itinerary..." : "Generate my itinerary"}
            </button>
          </form>
        </section>

        <section className="ai-result-card">
          <p className="ai-eyebrow">YOUR NEXT ADVENTURE</p>

          <h2>
            {itinerary ? "Your itinerary" : "Your trip, thoughtfully planned"}
          </h2>

          {!itinerary && !loading && (
            <div className="ai-empty-state">
              <h3>Your travel plan will appear here</h3>
              <p>
                Fill in your destination, travel dates and budget.
                Your concise, day-wise itinerary will appear here.
              </p>
            </div>
          )}

          {loading && (
            <div className="ai-loading-state" role="status">
              <div className="ai-loader" />
              <p>Planning your trip...</p>
              <span>Preparing activities and estimated costs.</span>
            </div>
          )}

          {itinerary && (
            <>
              <div className="ai-itinerary-content">
                <ReactMarkdown>{itinerary}</ReactMarkdown>
              </div>

              <p className="ai-disclaimer">
                AI-generated suggestions and prices are estimates.
                Verify travel details, opening hours and costs before your trip.
              </p>

              <div className="ai-result-actions">
                <button
                  type="button"
                  className="ai-generate-button"
                  onClick={handleSaveItinerary}
                  disabled={saving || loading}
                >
                  {saving ? "Saving trip..." : "Save Itinerary to My Trips"}
                </button>

                <button
                  type="button"
                  className="ai-new-trip-button"
                  onClick={handleNewTrip}
                  disabled={saving || loading}
                >
                  Plan a New Trip
                </button>

                {saveMessage && (
                  <p className="ai-success" role="status">
                    {saveMessage}
                  </p>
                )}

                {saveMessage && (
                  <button
                    type="button"
                    className="ai-new-trip-button"
                    onClick={() => navigate("/trips")}
                  >
                    View My Trips
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default AITripPlanner;
