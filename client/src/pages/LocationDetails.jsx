import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function LocationDetails() {
  const location = useLocation();
  const place = location.state?.place;

  const [showPlanner, setShowPlanner] = useState(false);

  // Wishlist
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [notes, setNotes] = useState("");

  // ================= WISHLIST =================

  const getLocationData = () => {
    const address = place?.address || {};

    return {
      name: place?.name || place?.display_name || "Unknown location",
      country: address.country || "Country unavailable",
      city:
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        "City unavailable",
      displayName: place?.display_name || "",
      latitude: Number(place?.lat),
      longitude: Number(place?.lon)
    };
  };

  const fetchWishlistStatus = async () => {
    const token = localStorage.getItem("token");

    if (!token || !place) {
      setIsWishlisted(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        const locationData = getLocationData();

        const exists = data.some((item) => {
          const saved = item.customLocation;

          if (!saved) return false;

          return (
            Number(saved.latitude) === locationData.latitude &&
            Number(saved.longitude) === locationData.longitude
          );
        });

        setIsWishlisted(exists);
      }
    } catch (error) {
      console.log("GET LOCATION WISHLIST ERROR:", error);
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to use your wishlist.");
      return;
    }

    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        return;
      }

      const response = await fetch("http://localhost:5000/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          customLocation: getLocationData()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setIsWishlisted(true);
      } else {
        alert(data.message || "Failed to add location to wishlist.");
      }
    } catch (error) {
      console.log("LOCATION WISHLIST ERROR:", error);
      alert("Server error. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistStatus();
  }, [place]);

  // ================= CREATE WORLDWIDE TRIP =================

  const handlePlannerSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before creating a trip.");
      return;
    }

    try {
      const address = place.address || {};

      const country =
        address.country || "Country unavailable";

      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        "City unavailable";

      const response = await fetch(
        "http://localhost:5000/api/trips",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            customLocation: {
              name:
                place.name ||
                place.display_name,

              country,

              city,

              displayName:
                place.display_name,

              latitude: Number(place.lat),

              longitude: Number(place.lon)
            },

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
      console.log(
        "WORLDWIDE TRIP ERROR:",
        error
      );

      alert(
        "Server error. Please try again."
      );
    }
  };


  // ================= LOCATION NOT FOUND =================

  if (!place) {
    return (
      <div className="about-page">

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

            <Link to="/about">
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


        <main className="about-container">

          <p className="about-label">
            LOCATION
          </p>

          <h1>
            Location not found
          </h1>

          <Link
            to="/"
            className="about-explore-button"
          >
            ← Back to Explore
          </Link>

        </main>

      </div>
    );
  }


  const address = place.address || {};

  const country =
    address.country ||
    "Country unavailable";

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    "City unavailable";

  const type =
    place.type ||
    place.class ||
    "Location";


  return (
    <div className="about-page">

      {/* ================= NAVBAR ================= */}

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

          <Link to="/about">
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


      {/* ================= MAIN ================= */}

      <main className="location-container">

        <p className="about-label">
          EXPLORE LOCATION
        </p>


        <h1>
          {place.name ||
            "Unknown location"}
        </h1>


        <p className="location-address">
          {place.display_name}
        </p>


        {/* ================= LOCATION INFO ================= */}

        <div className="location-info-grid">

          <div className="location-info-card">

            <span>
              COUNTRY
            </span>

            <strong>
              {country}
            </strong>

          </div>


          <div className="location-info-card">

            <span>
              CITY / AREA
            </span>

            <strong>
              {city}
            </strong>

          </div>


          <div className="location-info-card">

            <span>
              TYPE
            </span>

            <strong>
              {type}
            </strong>

          </div>

        </div>


        {/* ================= COORDINATES ================= */}

        <div className="location-coordinates">

          <p className="about-label">
            COORDINATES
          </p>


          <div className="coordinates-grid">

            <div>

              <span>
                LATITUDE
              </span>

              <strong>
                {place.lat}
              </strong>

            </div>


            <div>

              <span>
                LONGITUDE
              </span>

              <strong>
                {place.lon}
              </strong>

            </div>

          </div>

        </div>


        {/* ================= MAP ================= */}

        <div className="location-map">

          <p className="about-label">
            LOCATION MAP
          </p>


          <iframe
            title={`${place.name || "Location"} map`}

            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              Number(place.lon) - 0.08
            }%2C${
              Number(place.lat) - 0.05
            }%2C${
              Number(place.lon) + 0.08
            }%2C${
              Number(place.lat) + 0.05
            }&layer=mapnik&marker=${place.lat}%2C${place.lon}`}

            width="100%"

            height="400"

            style={{
              border: 0,
              borderRadius: "14px"
            }}

            loading="lazy"
          />

        </div>


        {/* ================= PLAN TRIP ================= */}

        <div className="location-plan-box">

          <div>

            <p className="about-label">
              READY TO GO?
            </p>

            <h2>
              Plan your trip to{" "}
              {place.name ||
                "this location"}
            </h2>

            <p>
              Start organizing your
              next adventure.
            </p>

          </div>


          <div className="location-plan-actions">
            <button
              type="button"
              className={`location-wishlist-button ${
                isWishlisted ? "saved" : ""
              }`}
              onClick={toggleWishlist}
              disabled={wishlistLoading}
            >
              {isWishlisted ? "♥ Saved" : "♡ Save"}
            </button>

            <button
              className="location-plan-button"
              onClick={() =>
                setShowPlanner(true)
              }
            >
              Plan Trip →
            </button>
          </div>

        </div>


        {/* ================= ACTIONS ================= */}

        <div className="location-actions">

          <a
            href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=15/${place.lat}/${place.lon}`}

            target="_blank"

            rel="noopener noreferrer"

            className="about-explore-button"
          >
            View on Map →
          </a>


          <Link
            to="/"
            className="location-back-button"
          >
            ← Back to Explore
          </Link>

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
                {place.name ||
                  "Your destination"}
              </h2>


              <p className="planner-subtitle">
                Tell us a few details
                about your trip.
              </p>


              <form
                onSubmit={
                  handlePlannerSubmit
                }
              >

                {/* Trip Name */}

                <label>
                  Trip name
                </label>

                <input
                  type="text"

                  placeholder={`My ${
                    place.name ||
                    "Trip"
                  } Trip`}

                  value={tripName}

                  onChange={(event) =>
                    setTripName(
                      event.target.value
                    )
                  }

                  required
                />


                {/* Dates */}

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


                {/* Travellers */}

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


                {/* Notes */}

                <label>
                  Notes
                </label>

                <textarea
                  placeholder="Anything you want to remember about this trip..."

                  value={notes}

                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
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

export default LocationDetails;