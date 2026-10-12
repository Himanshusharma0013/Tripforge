import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);
  const [saving, setSaving] = useState(false);

  // Worldwide location images
  const [locationImages, setLocationImages] = useState({});


  // =========================
  // FETCH TRIPS
  // =========================

  const fetchTrips = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/trips/my-trips",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTrips(data);
      } else {
        console.log(data);
      }

    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };


  // =========================
  // FETCH WORLDWIDE LOCATION IMAGE
  // =========================

  const fetchLocationImage = async (trip) => {

    // Existing destination already has an image
    if (
      trip.destination?.image ||
      !trip.customLocation
    ) {
      return;
    }


    const searchName =
      trip.customLocation.city ||
      trip.customLocation.name ||
      trip.customLocation.country;


    if (!searchName) {
      return;
    }


    try {

      const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: `${searchName} landmark`,
        gsrnamespace: "6",
        gsrlimit: "1",
        prop: "imageinfo",
        iiprop: "url",
        iiurlwidth: "900",
        format: "json",
        origin: "*"
      });


      const response = await fetch(
        `https://commons.wikimedia.org/w/api.php?${params}`
      );


      const data = await response.json();


      const pages =
        data?.query?.pages;


      if (!pages) {
        return;
      }


      const page =
        Object.values(pages)[0];


      const imageUrl =
        page?.imageinfo?.[0]?.thumburl ||
        page?.imageinfo?.[0]?.url;


      if (imageUrl) {

        setLocationImages(
          (previousImages) => ({
            ...previousImages,
            [trip._id]: imageUrl
          })
        );

      }

    } catch (error) {

      console.log(
        "LOCATION IMAGE ERROR:",
        error
      );

    }
  };


  // =========================
  // INITIAL FETCH
  // =========================

  useEffect(() => {
    fetchTrips();
  }, []);


  // =========================
  // FETCH IMAGES FOR WORLDWIDE TRIPS
  // =========================

  useEffect(() => {

    if (trips.length === 0) {
      return;
    }


    trips.forEach((trip) => {

      if (
        !trip.destination?.image &&
        trip.customLocation &&
        !locationImages[trip._id]
      ) {

        fetchLocationImage(trip);

      }

    });

  }, [trips]);


  // =========================
  // DELETE TRIP
  // =========================

  const handleDelete = async (tripId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trip?"
    );


    if (!confirmDelete) {
      return;
    }


    const token =
      localStorage.getItem("token");


    setDeleting(tripId);


    try {

      const response = await fetch(
        `http://localhost:5000/api/trips/${tripId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


      const data =
        await response.json();


      if (response.ok) {

        setTrips(
          (previousTrips) =>
            previousTrips.filter(
              (trip) =>
                trip._id !== tripId
            )
        );


        setLocationImages(
          (previousImages) => {

            const updatedImages = {
              ...previousImages
            };

            delete updatedImages[tripId];

            return updatedImages;
          }
        );

      } else {

        alert(
          data.message ||
            "Failed to delete trip"
        );

      }

    } catch (error) {

      console.log(error);

      alert(
        "Server error. Please try again."
      );

    }


    setDeleting(null);
  };


  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEdit = (trip) => {

    setEditingTrip({

      _id: trip._id,

      tripName:
        trip.tripName || "",

      startDate: trip.startDate
        ? new Date(trip.startDate)
            .toISOString()
            .split("T")[0]
        : "",

      endDate: trip.endDate
        ? new Date(trip.endDate)
            .toISOString()
            .split("T")[0]
        : "",

      travellers:
        trip.travellers || 1,

      notes:
        trip.notes || ""

    });

  };


  // =========================
  // UPDATE TRIP
  // =========================

  const handleUpdate = async (event) => {

    event.preventDefault();


    if (!editingTrip) {
      return;
    }


    const token =
      localStorage.getItem("token");


    setSaving(true);


    try {

      const response = await fetch(
        `http://localhost:5000/api/trips/${editingTrip._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({

            tripName:
              editingTrip.tripName,

            startDate:
              editingTrip.startDate,

            endDate:
              editingTrip.endDate,

            travellers:
              Number(
                editingTrip.travellers
              ),

            notes:
              editingTrip.notes

          })
        }
      );


      const data =
        await response.json();


      if (response.ok) {

        setTrips(
          (previousTrips) =>
            previousTrips.map(
              (trip) =>
                trip._id ===
                editingTrip._id
                  ? {
                      ...trip,
                      ...data.trip
                    }
                  : trip
            )
        );


        setEditingTrip(null);

      } else {

        alert(
          data.message ||
            "Failed to update trip"
        );

      }

    } catch (error) {

      console.log(error);

      alert(
        "Server error. Please try again."
      );

    }


    setSaving(false);
  };


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="detail-page">

        <p className="loading-text">
          Loading your trips...
        </p>

      </div>
    );

  }


  // =========================
  // MAIN
  // =========================

  return (
    <div className="detail-page">


      {/* =========================
          NAVBAR
      ========================= */}

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


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="detail-container">


        <p className="detail-label">
          YOUR JOURNEYS
        </p>


        <h1 className="trips-title">
          My Trips
        </h1>


        <p className="trips-subtitle">
          All your planned adventures in one place.
        </p>


        {/* =========================
            EMPTY STATE
        ========================= */}

        {trips.length === 0 ? (

          <div className="empty-trips">

            <h2>
              No trips yet
            </h2>


            <p>
              Start exploring destinations and plan
              your first adventure.
            </p>


            <Link
              to="/#destinations"
              className="explore-button"
            >
              Explore destinations
            </Link>

          </div>

        ) : (

          <div className="trips-grid">


            {trips.map((trip) => {

              // =========================
              // LOCATION DATA
              // =========================

              const destinationName =
                trip.destination?.name ||
                trip.customLocation?.name ||
                "Unknown location";


              const destinationCountry =
                trip.destination?.country ||
                trip.customLocation?.country ||
                "";


              const isWorldwideTrip =
                !trip.destination &&
                !!trip.customLocation;


              return (

                <div
                  className="trip-card"
                  key={trip._id}
                >


                  {/* =========================
                      EXISTING DESTINATION IMAGE
                  ========================= */}

                  {trip.destination?.image && (

                    <div className="trip-image">

                      <img
                        src={
                          trip.destination.image
                        }
                        alt={
                          trip.destination.name
                        }
                      />

                    </div>

                  )}


                  {/* =========================
                      WORLDWIDE LOCATION IMAGE
                  ========================= */}

                  {isWorldwideTrip && (

                    <div className="trip-image">

                      {locationImages[
                        trip._id
                      ] ? (

                        <img
                          src={
                            locationImages[
                              trip._id
                            ]
                          }
                          alt={
                            destinationName
                          }
                        />

                      ) : (

                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            minHeight:
                              "180px",
                            background:
                              "#202427",
                            width: "100%"
                          }}
                        >

                          <span
                            style={{
                              color:
                                "#8fa8bd",
                              fontSize:
                                "13px",
                              letterSpacing:
                                "2px"
                            }}
                          >
                            LOADING IMAGE...
                          </span>

                        </div>

                      )}

                    </div>

                  )}


                  {/* =========================
                      CARD CONTENT
                  ========================= */}

                  <div className="trip-card-content">


                    <p className="trip-destination">
                      {destinationCountry}
                    </p>


                    <h2>
                      {trip.tripName}
                    </h2>


                    <p className="trip-location">
                      {destinationName}
                    </p>


                    {/* =========================
                        TRIP DETAILS
                    ========================= */}

                    <div className="trip-details">


                      <div>

                        <span>
                          DATES
                        </span>


                        <strong>

                          {new Date(
                            trip.startDate
                          ).toLocaleDateString()}

                          {" → "}

                          {new Date(
                            trip.endDate
                          ).toLocaleDateString()}

                        </strong>

                      </div>


                      <div>

                        <span>
                          TRAVELLERS
                        </span>


                        <strong>
                          {trip.travellers}
                        </strong>

                      </div>


                    </div>


                    {/* =========================
                        NOTES
                    ========================= */}

    {trip.notes && (
  <p className="trip-notes">
    {trip.notes.startsWith("AI-generated travel plan")
      ? "AI-generated itinerary. Please use this plan as a reference only. Verify travel details, prices, and timings before your trip."
      : trip.notes.length > 120
        ? `${trip.notes.slice(0, 120).trim()}...`
        : trip.notes}
  </p>
)}


                    {/* =========================
                        VIEW
                    ========================= */}

                    <Link
                      to={`/trips/${trip._id}`}
                      className="view-trip-button"
                    >
                      View trip
                    </Link>


                    {/* =========================
                        EDIT
                    ========================= */}

                    <button
                      className="edit-trip-button"
                      onClick={() =>
                        handleEdit(trip)
                      }
                    >
                      Edit trip
                    </button>


                    {/* =========================
                        DELETE
                    ========================= */}

                    <button
                      className="delete-trip-button"
                      onClick={() =>
                        handleDelete(
                          trip._id
                        )
                      }
                      disabled={
                        deleting ===
                        trip._id
                      }
                    >

                      {deleting ===
                      trip._id
                        ? "Deleting..."
                        : "Delete trip"}

                    </button>


                  </div>

                </div>

              );

            })}

          </div>

        )}

      </main>


      {/* =========================
          EDIT TRIP MODAL
      ========================= */}

      {editingTrip && (

        <div
          className="login-overlay"
          onClick={() => {

            if (!saving) {
              setEditingTrip(null);
            }

          }}
        >

          <div
            className="login-modal edit-trip-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            <button
              className="close-login"
              onClick={() => {

                if (!saving) {
                  setEditingTrip(null);
                }

              }}
            >
              ×
            </button>


            <p className="section-label">
              UPDATE JOURNEY
            </p>


            <h2>
              Edit Trip
            </h2>


            <p className="login-subtitle">
              Update your travel plans.
            </p>


            <form
              onSubmit={handleUpdate}
            >


              {/* Trip name */}

              <label>
                Trip name
              </label>


              <input
                type="text"
                value={
                  editingTrip.tripName
                }
                onChange={(event) =>
                  setEditingTrip({
                    ...editingTrip,
                    tripName:
                      event.target.value
                  })
                }
                required
              />


              {/* Start date */}

              <label>
                Start date
              </label>


              <input
                type="date"
                value={
                  editingTrip.startDate
                }
                onChange={(event) =>
                  setEditingTrip({
                    ...editingTrip,
                    startDate:
                      event.target.value
                  })
                }
                required
              />


              {/* End date */}

              <label>
                End date
              </label>


              <input
                type="date"
                value={
                  editingTrip.endDate
                }
                onChange={(event) =>
                  setEditingTrip({
                    ...editingTrip,
                    endDate:
                      event.target.value
                  })
                }
                required
              />


              {/* Travellers */}

              <label>
                Travellers
              </label>


              <input
                type="number"
                min="1"
                value={
                  editingTrip.travellers
                }
                onChange={(event) =>
                  setEditingTrip({
                    ...editingTrip,
                    travellers:
                      event.target.value
                  })
                }
                required
              />


              {/* Notes */}

              <label>
                Notes
              </label>


              <textarea
                value={
                  editingTrip.notes
                }
                onChange={(event) =>
                  setEditingTrip({
                    ...editingTrip,
                    notes:
                      event.target.value
                  })
                }
                placeholder="Add some notes..."
                rows="3"
              />


              {/* Save */}

              <button
                type="submit"
                className="login-submit"
                disabled={saving}
              >

                {saving
                  ? "Saving changes..."
                  : "Save changes"}

              </button>


            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default MyTrips;