import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function DestinationDetails() {
  const { id } = useParams();

  const [destination, setDestination] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cafesLoading, setCafesLoading] = useState(true);
  const [hotelsLoading, setHotelsLoading] = useState(true);

  const [showPlanner, setShowPlanner] = useState(false);

  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [notes, setNotes] = useState("");

  // Fetch destination
  useEffect(() => {
    fetch(`http://localhost:5000/api/destinations/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setDestination(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [id]);

  // Fetch cafes
  useEffect(() => {
    fetch(
      `http://localhost:5000/api/cafes/destination/${id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setCafes(data);
        setCafesLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setCafesLoading(false);
      });
  }, [id]);

  // Fetch hotels
  useEffect(() => {
    fetch(
      `http://localhost:5000/api/hotels/destination/${id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setHotels(data);
        setHotelsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setHotelsLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <p className="loading-text">
          Loading destination...
        </p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="detail-page">
        <p className="loading-text">
          Destination not found.
        </p>

        <Link
          to="/#destinations"
          className="back-link"
        >
          ← Back to destinations
        </Link>
      </div>
    );
  }

  // Create Trip
  const handlePlannerSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before creating a trip.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/trips",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            destination: destination._id,
            tripName,
            startDate,
            endDate,
            travellers: Number(travellers),
            notes
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Trip created successfully!");

        setShowPlanner(false);

        setTripName("");
        setStartDate("");
        setEndDate("");
        setTravellers(1);
        setNotes("");
      } else {
        alert(
          data.message ||
            "Failed to create trip."
        );
      }
    } catch (error) {
      console.log(error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="detail-page">

      {/* Navbar */}

      <nav className="navbar">

        <Link
          to="/"
          className="logo"
        >
          TripForge
        </Link>

        <div className="nav-links">

          <Link to="/#destinations">
            Explore
          </Link>

          <Link to="/trips">
            Trips
          </Link>

          <Link to="/">
            About
          </Link>

        </div>

        <Link
          to="/"
          className="login-button detail-home-button"
        >
          Home
        </Link>

      </nav>


      <main className="detail-container">

        {/* Back */}

        <Link
          to="/#destinations"
          className="back-link"
        >
          ← Back to destinations
        </Link>


        {/* Header */}

        <div className="detail-header">

          <div>

            <p className="detail-label">
              DESTINATION
            </p>

            <h1>
              {destination.name}
            </h1>

            <p className="detail-country">
              {destination.country}
            </p>

          </div>


          <div className="detail-budget">

            <span>
              STARTING FROM
            </span>

            <strong>
              ₹{destination.budget}
            </strong>

          </div>

        </div>


        {/* Image */}

        <div className="detail-image-wrapper">

          <img
            src={destination.image}
            alt={destination.name}
            className="detail-image"
          />

        </div>


        {/* Information */}

        <div className="detail-info-grid">

          <div className="detail-description">

            <p className="detail-label">
              ABOUT THE DESTINATION
            </p>

            <h2>
              Why visit {destination.name}?
            </h2>

            <p>
              {destination.description}
            </p>

          </div>


          <div className="detail-side">

            {/* Best Time */}

            <div className="info-card">

              <span>
                BEST TIME TO VISIT
              </span>

              <strong>
                {destination.bestTime}
              </strong>

            </div>


            {/* Activities */}

            <div className="info-card">

              <span>
                POPULAR ACTIVITIES
              </span>

              <div className="activities-list">

                {destination.activities.map(
                  (activity) => (
                    <span
                      className="activity-tag"
                      key={activity}
                    >
                      {activity}
                    </span>
                  )
                )}

              </div>

            </div>

          </div>

        </div>


        {/* ================= CAFES ================= */}

        <section className="cafes-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                EXPLORE AROUND
              </p>

              <h2>
                Cafés in {destination.name}
              </h2>

            </div>

            <p className="destination-count">
              {cafes.length} café
              {cafes.length !== 1 ? "s" : ""}
            </p>

          </div>


          {cafesLoading ? (

            <p className="loading-text">
              Loading cafés...
            </p>

          ) : cafes.length === 0 ? (

            <p className="no-results">
              No cafés found for this destination.
            </p>

          ) : (

            <div className="cafes-grid">

              {cafes.map((cafe) => (

                <article
                  className="cafe-card"
                  key={cafe._id}
                >

                  <div className="cafe-image-container">

                    <img
                      src={cafe.image}
                      alt={cafe.name}
                    />

                  </div>


                  <div className="cafe-card-content">

                    <div className="cafe-card-top">

                      <div>

                        <h3>
                          {cafe.name}
                        </h3>

                        <p className="cafe-address">
                          {cafe.address}
                        </p>

                      </div>

                      <span className="cafe-rating">
                        ★ {cafe.rating}
                      </span>

                    </div>


                    <p className="cafe-description">
                      {cafe.description}
                    </p>


                    <div className="cafe-footer">

                      <span>
                        {cafe.priceRange}
                      </span>

                      <span>
                        Café
                      </span>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>


        {/* ================= HOTELS ================= */}

        <section className="hotels-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                STAY YOUR WAY
              </p>

              <h2>
                Hotels in {destination.name}
              </h2>

            </div>

            <p className="destination-count">
              {hotels.length} hotel
              {hotels.length !== 1 ? "s" : ""}
            </p>

          </div>


          {hotelsLoading ? (

            <p className="loading-text">
              Loading hotels...
            </p>

          ) : hotels.length === 0 ? (

            <p className="no-results">
              No hotels found for this destination.
            </p>

          ) : (

            <div className="hotels-grid">

              {hotels.map((hotel) => (

                <article
                  className="hotel-card"
                  key={hotel._id}
                >

                  <div className="hotel-image-container">

                    <img
                      src={hotel.image}
                      alt={hotel.name}
                    />

                  </div>


                  <div className="hotel-card-content">

                    <div className="hotel-card-top">

                      <div>

                        <h3>
                          {hotel.name}
                        </h3>

                        <p className="hotel-address">
                          {hotel.address}
                        </p>

                      </div>

                      <span className="hotel-rating">
                        ★ {hotel.rating}
                      </span>

                    </div>


                    <p className="hotel-description">
                      {hotel.description}
                    </p>


                    <div className="hotel-footer">

                      <span>
                        {hotel.priceRange}
                      </span>

                      <span>
                        Hotel
                      </span>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>


        {/* ================= PLAN TRIP ================= */}

        <div className="plan-trip-box">

          <div>

            <p className="detail-label">
              READY TO GO?
            </p>

            <h2>
              Plan your {destination.name} trip
            </h2>

            <p>
              Create your personalized trip and keep
              all your plans in one place.
            </p>

          </div>


          <button
            className="plan-trip-button"
            onClick={() =>
              setShowPlanner(true)
            }
          >
            Plan this trip →
          </button>

        </div>


        {/* ================= TRIP PLANNER MODAL ================= */}

        {showPlanner && (

          <div
            className="planner-overlay"
            onClick={() =>
              setShowPlanner(false)
            }
          >

            <div
              className="planner-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                className="planner-close"
                onClick={() =>
                  setShowPlanner(false)
                }
              >
                ×
              </button>


              <p className="detail-label">
                PLAN YOUR TRIP
              </p>

              <h2>
                {destination.name}
              </h2>

              <p className="planner-subtitle">
                Tell us a few details about your trip.
              </p>


              <form
                onSubmit={handlePlannerSubmit}
              >

                <label>
                  Trip name
                </label>

                <input
                  type="text"
                  placeholder="My Manali Trip"
                  value={tripName}
                  onChange={(event) =>
                    setTripName(event.target.value)
                  }
                  required
                />


                <div className="planner-row">

                  <div>

                    <label>
                      Start date
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) =>
                        setStartDate(
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>


                  <div>

                    <label>
                      End date
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(
                          event.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>


                <label>
                  Travellers
                </label>

                <input
                  type="number"
                  min="1"
                  max="20"
                  value={travellers}
                  onChange={(event) =>
                    setTravellers(
                      event.target.value
                    )
                  }
                  required
                />


                <label>
                  Notes
                </label>

                <textarea
                  placeholder="Anything you want to remember about this trip..."
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  rows="4"
                />


                <button
                  type="submit"
                  className="create-trip-button"
                >
                  Create trip
                </button>

              </form>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default DestinationDetails;