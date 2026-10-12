import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./TripDetails.css";
function TripDetails() {
  const { id } = useParams();

  const [trip, setTrip] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [placeImages, setPlaceImages] = useState({});
  const [itinerary, setItinerary] = useState([]);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [itineraryDay, setItineraryDay] = useState(1);
  const [itineraryTitle, setItineraryTitle] = useState("");
  const [itineraryDescription, setItineraryDescription] = useState("");
  const [itineraryTime, setItineraryTime] = useState("");
  const [editingItinerary, setEditingItinerary] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Other");
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");

  // =========================
  // FETCH TRIP
  // =========================

  const fetchTrip = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/trips/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTrip(data);
      } else {
        console.log(data);
      }

    } catch (error) {
      console.log("GET TRIP ERROR:", error);
    }

    setLoading(false);
  };


  // =========================
  // FETCH EXISTING DESTINATION
  // CAFES + HOTELS
  // =========================

  const fetchDestinationPlaces = async (destinationId) => {
    try {

      setNearbyLoading(true);

      const [cafeResponse, hotelResponse] =
        await Promise.all([

          fetch(
            `http://localhost:5000/api/cafes/destination/${destinationId}`
          ),

          fetch(
            `http://localhost:5000/api/hotels/destination/${destinationId}`
          )

        ]);


      const cafeData =
        await cafeResponse.json();

      const hotelData =
        await hotelResponse.json();


      if (cafeResponse.ok) {
        setCafes(cafeData);

        cafeData.forEach((cafe) => {
          fetchPlaceImage(cafe);
        });
      }

      if (hotelResponse.ok) {
        setHotels(hotelData);

        hotelData.forEach((hotel) => {
          fetchPlaceImage(hotel);
        });
      }

    } catch (error) {

      console.log(
        "DESTINATION PLACES ERROR:",
        error
      );

    }

    setNearbyLoading(false);
  };
const fetchPlaceImage = async (place) => {
  if (!place?.name) {
    return;
  }

  const placeId = place._id || place.id;

  if (!placeId) {
    return;
  }

  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: place.name,
      gsrnamespace: "6",
      gsrlimit: "1",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "700",
      format: "json",
      origin: "*"
    });

    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params}`
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const pages = data?.query?.pages;

    if (!pages) {
      return;
    }

    const page = Object.values(pages)[0];

    const imageUrl =
      page?.imageinfo?.[0]?.thumburl ||
      page?.imageinfo?.[0]?.url;

    if (imageUrl) {
      setPlaceImages((previousImages) => ({
        ...previousImages,
        [placeId]: imageUrl
      }));
    }
  } catch (error) {
    console.log("PLACE IMAGE ERROR:", error);
  }
};

  // =========================
  // FETCH WORLDWIDE PLACES
  // =========================

  const fetchWorldwidePlaces = async (
    latitude,
    longitude
  ) => {

    try {

      setNearbyLoading(true);

      const [cafeResponse, hotelResponse] =
        await Promise.all([

          fetch(
            `http://localhost:5000/api/nearby?lat=${latitude}&lon=${longitude}&type=cafe`
          ),

          fetch(
            `http://localhost:5000/api/nearby?lat=${latitude}&lon=${longitude}&type=hotel`
          )

        ]);


      const cafeData =
        await cafeResponse.json();

      const hotelData =
        await hotelResponse.json();


      if (cafeResponse.ok) {
        setCafes(cafeData);

        cafeData.forEach((cafe) => {
          fetchPlaceImage(cafe);
        });
      } else {
        setCafes([]);
      }


      if (hotelResponse.ok) {
        setHotels(hotelData);

        hotelData.forEach((hotel) => {
          fetchPlaceImage(hotel);
        });
      } else {
        setHotels([]);
      }

    } catch (error) {

      console.log(
        "WORLDWIDE PLACES ERROR:",
        error
      );

      setCafes([]);
      setHotels([]);

    }

    setNearbyLoading(false);
  };


  // =========================
  // FETCH EXPENSES
  // =========================

  const fetchExpenses = async (tripId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      setExpenseLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/expenses/trip/${tripId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setExpenses(data);
      } else {
        setExpenses([]);
        console.log(data);
      }
    } catch (error) {
      console.log("GET EXPENSES ERROR:", error);
      setExpenses([]);
    } finally {
      setExpenseLoading(false);
    }
  };


  // =========================
  // CREATE EXPENSE
  // =========================

  const handleExpenseSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before adding an expense.");
      return;
    }

    if (!expenseTitle.trim()) {
      alert("Please enter an expense title.");
      return;
    }

    if (!expenseAmount || Number(expenseAmount) < 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            tripId: id,
            title: expenseTitle.trim(),
            amount: Number(expenseAmount),
            category: expenseCategory,
            date: expenseDate || undefined,
            notes: expenseNotes.trim()
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setExpenses((previous) => [
          data.expense,
          ...previous
        ]);

        closeExpenseForm();
      } else {
        alert(
          data.message ||
          "Failed to add expense."
        );
      }
    } catch (error) {
      console.log("CREATE EXPENSE ERROR:", error);
      alert("Server error. Please try again.");
    }
  };


  // =========================
  // UPDATE EXPENSE
  // =========================

  const handleExpenseUpdate = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before editing an expense.");
      return;
    }

    if (!expenseTitle.trim()) {
      alert("Please enter an expense title.");
      return;
    }

    if (!expenseAmount || Number(expenseAmount) < 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/expenses/${editingExpense._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: expenseTitle.trim(),
            amount: Number(expenseAmount),
            category: expenseCategory,
            date: expenseDate || undefined,
            notes: expenseNotes.trim()
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setExpenses((previous) =>
          previous.map((expense) =>
            expense._id === editingExpense._id
              ? data.expense
              : expense
          )
        );

        closeExpenseForm();
      } else {
        alert(
          data.message ||
          "Failed to update expense."
        );
      }
    } catch (error) {
      console.log("UPDATE EXPENSE ERROR:", error);
      alert("Server error. Please try again.");
    }
  };


  // =========================
  // DELETE EXPENSE
  // =========================

  const handleExpenseDelete = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before deleting an expense.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/expenses/${expenseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setExpenses((previous) =>
          previous.filter(
            (expense) => expense._id !== expenseId
          )
        );
      } else {
        alert(
          data.message ||
          "Failed to delete expense."
        );
      }
    } catch (error) {
      console.log("DELETE EXPENSE ERROR:", error);
      alert("Server error. Please try again.");
    }
  };


  // =========================
  // OPEN EXPENSE EDIT FORM
  // =========================

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseTitle(expense.title || "");
    setExpenseAmount(expense.amount ?? "");
    setExpenseCategory(expense.category || "Other");
    setExpenseDate(
      expense.date
        ? new Date(expense.date)
            .toISOString()
            .split("T")[0]
        : ""
    );
    setExpenseNotes(expense.notes || "");
    setShowExpenseForm(true);
  };


  // =========================
  // CLOSE EXPENSE FORM
  // =========================

  const closeExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseCategory("Other");
    setExpenseDate("");
    setExpenseNotes("");
  };


  // =========================
  // FETCH ITINERARY
  // =========================

  const fetchItinerary = async (tripId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      setItineraryLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/itinerary/trip/${tripId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setItinerary(data);
      } else {
        setItinerary([]);
        console.log(data);
      }
    } catch (error) {
      console.log("GET ITINERARY ERROR:", error);
      setItinerary([]);
    }

    setItineraryLoading(false);
  };


  // =========================
  // CREATE ITINERARY
  // =========================

  const handleItinerarySubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before adding an itinerary.");
      return;
    }

    if (!itineraryTitle.trim()) {
      alert("Please enter an activity title.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/itinerary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            tripId: id,
            day: Number(itineraryDay),
            title: itineraryTitle.trim(),
            description: itineraryDescription.trim(),
            time: itineraryTime
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setItinerary((previous) =>
          [...previous, data.itinerary].sort(
            (a, b) =>
              a.day - b.day ||
              (a.time || "").localeCompare(b.time || "")
          )
        );

        setShowItineraryForm(false);
        setItineraryDay(1);
        setItineraryTitle("");
        setItineraryDescription("");
        setItineraryTime("");
      } else {
        alert(
          data.message ||
          "Failed to add itinerary activity."
        );
      }
    } catch (error) {
      console.log("CREATE ITINERARY ERROR:", error);
      alert("Server error. Please try again.");
    }
  };


  // =========================
  // UPDATE ITINERARY
  // =========================

  const handleItineraryUpdate = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before editing an itinerary.");
      return;
    }

    if (!itineraryTitle.trim()) {
      alert("Please enter an activity title.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/itinerary/${editingItinerary._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            day: Number(itineraryDay),
            title: itineraryTitle.trim(),
            description: itineraryDescription.trim(),
            time: itineraryTime
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setItinerary((previous) =>
          previous
            .map((item) =>
              item._id === editingItinerary._id
                ? data.itinerary
                : item
            )
            .sort(
              (a, b) =>
                a.day - b.day ||
                (a.time || "").localeCompare(b.time || "")
            )
        );

        closeItineraryForm();
      } else {
        alert(data.message || "Failed to update itinerary activity.");
      }
    } catch (error) {
      console.log("UPDATE ITINERARY ERROR:", error);
      alert("Server error. Please try again.");
    }
  };


  // =========================
  // DELETE ITINERARY
  // =========================

  const handleItineraryDelete = async (itemId) => {
    if (!window.confirm("Delete this itinerary activity?")) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before deleting an itinerary.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/itinerary/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setItinerary((previous) =>
          previous.filter((item) => item._id !== itemId)
        );
      } else {
        alert(data.message || "Failed to delete itinerary activity.");
      }
    } catch (error) {
      console.log("DELETE ITINERARY ERROR:", error);
      alert("Server error. Please try again.");
    }
  };


  // =========================
  // OPEN EDIT FORM
  // =========================

  const openEditItinerary = (item) => {
    setEditingItinerary(item);
    setItineraryDay(item.day);
    setItineraryTitle(item.title || "");
    setItineraryDescription(item.description || "");
    setItineraryTime(item.time || "");
    setShowItineraryForm(true);
  };


  // =========================
  // CLOSE ITINERARY FORM
  // =========================

  const closeItineraryForm = () => {
    setShowItineraryForm(false);
    setEditingItinerary(null);
    setItineraryDay(1);
    setItineraryTitle("");
    setItineraryDescription("");
    setItineraryTime("");
  };


  // =========================
  // INITIAL FETCH
  // =========================

  useEffect(() => {
    fetchTrip();
  }, [id]);


  // =========================
  // FETCH PLACES AFTER TRIP
  // =========================

  useEffect(() => {

    if (!trip) {
      return;
    }

    fetchItinerary(trip._id);
    fetchExpenses(trip._id);


    // Existing MongoDB destination
    if (trip.destination?._id) {

      fetchDestinationPlaces(
        trip.destination._id
      );

      return;
    }


    // Worldwide location
    if (
      trip.customLocation?.latitude &&
      trip.customLocation?.longitude
    ) {

      fetchWorldwidePlaces(
        trip.customLocation.latitude,
        trip.customLocation.longitude
      );

    }

  }, [trip]);


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="detail-page">

        <p className="loading-text">
          Loading trip...
        </p>

      </div>
    );

  }


  // =========================
  // NOT FOUND
  // =========================

  if (!trip) {

    return (
      <div className="detail-page">

        <div className="detail-container">

          <h1>
            Trip not found
          </h1>

          <Link
            to="/trips"
            className="back-to-trips"
          >
            Back to My Trips
          </Link>

        </div>

      </div>
    );

  }


  // =========================
  // LOCATION
  // =========================

  const isWorldwideTrip =
    !trip.destination &&
    !!trip.customLocation;


  const locationName =
    trip.destination?.name ||
    trip.customLocation?.name ||
    "Unknown location";


  const locationCountry =
    trip.destination?.country ||
    trip.customLocation?.country ||
    "";


 const locationCity =
  trip.customLocation?.city ||
  trip.customLocation?.name ||
  trip.destination?.name ||
  "Unknown";


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
          TRIP CONTENT
      ========================= */}

      <main className="detail-container">


        <p className="detail-label">
          YOUR JOURNEY
        </p>


        <h1 className="trip-details-title">
          {trip.tripName}
        </h1>


        <p className="trip-details-location">
          {locationName}
          {locationCountry
            ? `, ${locationCountry}`
            : ""}
        </p>


        {/* =========================
            DESTINATION / WORLDWIDE
            IMAGE OR MAP
        ========================= */}

        {trip.destination?.image && (

          <div className="trip-details-image">

            <img
              src={trip.destination.image}
              alt={locationName}
            />

          </div>

        )}


        {isWorldwideTrip && (

          <div className="trip-details-image">

            <iframe
              title={`Map of ${locationName}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                Number(
                  trip.customLocation.longitude
                ) - 0.05
              }%2C${
                Number(
                  trip.customLocation.latitude
                ) - 0.05
              }%2C${
                Number(
                  trip.customLocation.longitude
                ) + 0.05
              }%2C${
                Number(
                  trip.customLocation.latitude
                ) + 0.05
              }&layer=mapnik&marker=${
                trip.customLocation.latitude
              }%2C${
                trip.customLocation.longitude
              }`}
              width="100%"
              height="400"
              style={{
                border: 0,
                borderRadius: "14px"
              }}
            />

          </div>

        )}


        {/* =========================
            TRIP INFORMATION
        ========================= */}

        <div className="trip-info-grid">


          <div className="trip-info-card">

            <span>
              DESTINATION
            </span>

            <strong>
              {locationName}
            </strong>

          </div>


          <div className="trip-info-card">

            <span>
              START DATE
            </span>

            <strong>
              {new Date(
                trip.startDate
              ).toLocaleDateString()}
            </strong>

          </div>


          <div className="trip-info-card">

            <span>
              END DATE
            </span>

            <strong>
              {new Date(
                trip.endDate
              ).toLocaleDateString()}
            </strong>

          </div>


          <div className="trip-info-card">

            <span>
              TRAVELLERS
            </span>

            <strong>
              {trip.travellers}
            </strong>

          </div>

        </div>


        {/* =========================
            WORLDWIDE LOCATION INFO
        ========================= */}

        {isWorldwideTrip && (

          <div className="trip-worldwide-info">

            <p className="detail-label">
              WORLDWIDE DESTINATION
            </p>

            <h2>
              {locationCity}
              {locationCountry
                ? `, ${locationCountry}`
                : ""}
            </h2>


            <div className="trip-worldwide-coordinates">


              <div>

                <span>
                  LATITUDE
                </span>

                <strong>
                  {
                    trip.customLocation.latitude
                  }
                </strong>

              </div>


              <div>

                <span>
                  LONGITUDE
                </span>

                <strong>
                  {
                    trip.customLocation.longitude
                  }
                </strong>

              </div>


            </div>

          </div>

        )}


        {/* =========================
            NOTES
        ========================= */}

        
{trip.notes && (
  <div className="trip-notes-section">
    <p className="detail-label">
      TRIP NOTES
    </p>

    <div className="trip-notes-content">
      <ReactMarkdown>
        {trip.notes.replace(/^"|"$/g, "")}
      </ReactMarkdown>
    </div>
  </div>
)}
```


        {/* =========================
            ITINERARY
        ========================= */}

        <section className="trip-itinerary-section">

          <div className="trip-itinerary-heading">

            <div>
              <p className="trip-details-label">
                YOUR PLAN
              </p>

              <h2>
                Itinerary
              </h2>

              <span>
                Plan your trip day by day
              </span>
            </div>

            <button
              type="button"
              className="itinerary-add-button"
              onClick={() => { closeItineraryForm(); setShowItineraryForm(true); }}
            >
              + Add Activity
            </button>

          </div>


          {itineraryLoading && (
            <p className="search-status">
              Loading itinerary...
            </p>
          )}


          {!itineraryLoading && itinerary.length === 0 && (
            <div className="itinerary-empty">
              <p>Your itinerary is empty.</p>
              <span>
                Add activities to start planning your trip.
              </span>
            </div>
          )}


          {!itineraryLoading && itinerary.length > 0 && (
            <div className="itinerary-list">

              {Array.from(
                new Set(itinerary.map((item) => item.day))
              )
                .sort((a, b) => a - b)
                .map((day) => (

                  <div className="itinerary-day" key={day}>

                    <div className="itinerary-day-title">
                      <span>DAY {day}</span>
                    </div>

                    <div className="itinerary-activities">

                      {itinerary
                        .filter((item) => item.day === day)
                        .map((item) => (

                          <div
                            className="itinerary-item"
                            key={item._id}
                          >

                            <div className="itinerary-item-time">
                              {item.time || "Any time"}
                            </div>

                            <div className="itinerary-item-content">
                              <h3>{item.title}</h3>

                              {item.description && (
                                <p>{item.description}</p>
                              )}

                              <div className="itinerary-item-actions">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditItinerary(item)
                                  }
                                >
                                  ✏ Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleItineraryDelete(item._id)
                                  }
                                >
                                  🗑 Delete
                                </button>
                              </div>
                            </div>

                          </div>

                        ))}

                    </div>

                  </div>

                ))}

            </div>
          )}

        </section>


        {/* =========================
            ADD ITINERARY MODAL
        ========================= */}

        {showItineraryForm && (
          <div
            className="itinerary-modal-overlay"
            onClick={closeItineraryForm}
          >

            <div
              className="itinerary-modal"
              onClick={(event) => event.stopPropagation()}
            >

              <div className="itinerary-modal-header">

                <div>
                  <p className="detail-label">
                    PLAN YOUR DAY
                  </p>

                  <h2>
                    {editingItinerary ? "Edit Activity" : "Add Activity"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="itinerary-close-button"
                  onClick={closeItineraryForm}
                >
                  ×
                </button>

              </div>


              <form
                onSubmit={
                  editingItinerary
                    ? handleItineraryUpdate
                    : handleItinerarySubmit
                }
                className="itinerary-form"
              >

                <label>
                  Day
                  <input
                    type="number"
                    min="1"
                    value={itineraryDay}
                    onChange={(event) =>
                      setItineraryDay(event.target.value)
                    }
                    required
                  />
                </label>


                <label>
                  Activity
                  <input
                    type="text"
                    placeholder="e.g. Visit British Museum"
                    value={itineraryTitle}
                    onChange={(event) =>
                      setItineraryTitle(event.target.value)
                    }
                    required
                  />
                </label>


                <label>
                  Time
                  <input
                    type="time"
                    value={itineraryTime}
                    onChange={(event) =>
                      setItineraryTime(event.target.value)
                    }
                  />
                </label>


                <label>
                  Description
                  <textarea
                    placeholder="Add some details..."
                    value={itineraryDescription}
                    onChange={(event) =>
                      setItineraryDescription(event.target.value)
                    }
                    rows="4"
                  />
                </label>


                <button
                  type="submit"
                  className="itinerary-submit-button"
                >
                  {editingItinerary
                    ? "Save Changes"
                    : "Add to Itinerary"}
                </button>

              </form>

            </div>

          </div>
        )}


        {/* =========================
            BUDGET TRACKER
        ========================= */}

        <section className="trip-budget-section">

          <div className="trip-budget-heading">

            <div>
              <p className="trip-details-label">
                TRIP FINANCES
              </p>

              <h2>
                Budget Tracker
              </h2>

              <span>
                Keep track of your travel expenses
              </span>
            </div>

            <button
              type="button"
              className="budget-add-button"
              onClick={() => {
                closeExpenseForm();
                setShowExpenseForm(true);
              }}
            >
              + Add Expense
            </button>

          </div>


          <div className="budget-summary">

            <div className="budget-summary-card">
              <span>
                TOTAL SPENT
              </span>

              <strong>
                ₹{expenses
                  .reduce(
                    (total, expense) =>
                      total + Number(expense.amount || 0),
                    0
                  )
                  .toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="budget-summary-card">
              <span>
                EXPENSES
              </span>

              <strong>
                {expenses.length}
              </strong>
            </div>

            <div className="budget-summary-card">
              <span>
                CATEGORIES
              </span>

              <strong>
                {new Set(
                  expenses.map(
                    (expense) => expense.category
                  )
                ).size}
              </strong>
            </div>

          </div>


          {expenses.length > 0 && (
            <div className="budget-breakdown">

              <div className="budget-breakdown-heading">
                <div>
                  <h3>Spending Breakdown</h3>
                  <span>See where your trip money is going</span>
                </div>
              </div>

              <div className="budget-category-list">
                {Array.from(
                  expenses.reduce((map, expense) => {
                    const category = expense.category || "Other";
                    const amount = Number(expense.amount || 0);
                    map.set(category, (map.get(category) || 0) + amount);
                    return map;
                  }, new Map())
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const total = expenses.reduce(
                      (sum, expense) => sum + Number(expense.amount || 0),
                      0
                    );
                    const percentage = total > 0 ? (amount / total) * 100 : 0;

                    return (
                      <div className="budget-category-row" key={category}>
                        <div className="budget-category-top">
                          <span>{category}</span>
                          <strong>
                            ₹{amount.toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div className="budget-category-track">
                          <div
                            className="budget-category-bar"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <span className="budget-category-percent">
                          {percentage.toFixed(0)}% of total
                        </span>
                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {expenseLoading && (
            <p className="search-status">
              Loading expenses...
            </p>
          )}


          {!expenseLoading &&
            expenses.length === 0 && (
              <div className="budget-empty">
                <p>
                  No expenses added yet.
                </p>

                <span>
                  Add your first expense to start tracking your trip budget.
                </span>
              </div>
            )}


          {!expenseLoading &&
            expenses.length > 0 && (
              <div className="expense-list">

                {expenses.map((expense) => (
                  <div
                    className="expense-item"
                    key={expense._id}
                  >

                    <div className="expense-item-main">

                      <div>
                        <h3>
                          {expense.title}
                        </h3>

                        <span className="expense-category">
                          {expense.category}
                        </span>
                      </div>

                      <strong className="expense-amount">
                        ₹{Number(
                          expense.amount || 0
                        ).toLocaleString("en-IN")}
                      </strong>

                    </div>


                    <div className="expense-item-bottom">

                      <span>
                        {expense.date
                          ? new Date(
                              expense.date
                            ).toLocaleDateString()
                          : "No date"}
                      </span>

                      {expense.notes && (
                        <p>
                          {expense.notes}
                        </p>
                      )}

                      <div className="expense-actions">

                        <button
                          type="button"
                          onClick={() =>
                            openEditExpense(expense)
                          }
                        >
                          ✏ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleExpenseDelete(
                              expense._id
                            )
                          }
                        >
                          🗑 Delete
                        </button>

                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}

        </section>


        {/* =========================
            ADD / EDIT EXPENSE MODAL
        ========================= */}

        {showExpenseForm && (
          <div
            className="expense-modal-overlay"
            onClick={closeExpenseForm}
          >

            <div
              className="expense-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="expense-modal-header">

                <div>
                  <p className="detail-label">
                    TRIP FINANCES
                  </p>

                  <h2>
                    {editingExpense
                      ? "Edit Expense"
                      : "Add Expense"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="expense-close-button"
                  onClick={closeExpenseForm}
                >
                  ×
                </button>

              </div>


              <form
                onSubmit={
                  editingExpense
                    ? handleExpenseUpdate
                    : handleExpenseSubmit
                }
                className="expense-form"
              >

                <label>
                  Expense
                  <input
                    type="text"
                    placeholder="e.g. Hotel booking"
                    value={expenseTitle}
                    onChange={(event) =>
                      setExpenseTitle(
                        event.target.value
                      )
                    }
                    required
                  />
                </label>


                <label>
                  Amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 2500"
                    value={expenseAmount}
                    onChange={(event) =>
                      setExpenseAmount(
                        event.target.value
                      )
                    }
                    required
                  />
                </label>


                <label>
                  Category
                  <select
                    value={expenseCategory}
                    onChange={(event) =>
                      setExpenseCategory(
                        event.target.value
                      )
                    }
                  >
                    <option value="Hotel">
                      Hotel
                    </option>

                    <option value="Food">
                      Food
                    </option>

                    <option value="Transport">
                      Transport
                    </option>

                    <option value="Activities">
                      Activities
                    </option>

                    <option value="Shopping">
                      Shopping
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </label>


                <label>
                  Date
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(event) =>
                      setExpenseDate(
                        event.target.value
                      )
                    }
                  />
                </label>


                <label>
                  Notes
                  <textarea
                    placeholder="Add some details..."
                    value={expenseNotes}
                    onChange={(event) =>
                      setExpenseNotes(
                        event.target.value
                      )
                    }
                    rows="4"
                  />
                </label>


                <button
                  type="submit"
                  className="expense-submit-button"
                >
                  {editingExpense
                    ? "Save Changes"
                    : "Add Expense"}
                </button>

              </form>

            </div>

          </div>
        )}


        {/* =========================
            CAFES + HOTELS
        ========================= */}

        <section className="trip-recommendations">


          <div className="trip-recommendation-heading">

            <p className="trip-details-label">
              {isWorldwideTrip
                ? "NEARBY PLACES"
                : "LOCAL RECOMMENDATIONS"}
            </p>

            <h2>
              Cafés & Hotels
            </h2>

            <span>
              {isWorldwideTrip
                ? `Places near ${locationName}`
                : `Places to explore in ${locationName}`}
            </span>

          </div>


          {/* =========================
              LOADING
          ========================= */}

          {nearbyLoading && (

            <p className="search-status">
              Finding nearby places...
            </p>

          )}


          {/* =========================
              CAFES
          ========================= */}

          {!nearbyLoading &&
            cafes.length > 0 && (

              <div className="trip-place-section">

                <h3 className="trip-place-title">
                  Cafés
                </h3>


                <div className="cafes-grid">

                  {cafes.slice(0, 3).map(
                    (cafe) => (

                      <div
                        className="cafe-card"
                        key={cafe._id || cafe.id}
                      >

                        {placeImages[cafe._id || cafe.id] && (
                          <img
                            src={placeImages[cafe._id || cafe.id]}
                            alt={cafe.name}
                            style={{
                              width: "100%",
                              height: "180px",
                              objectFit: "cover",
                              display: "block",
                              borderRadius: "10px 10px 0 0"
                            }}
                          />
                        )}

                        <div className="cafe-card-top">

                          <h3>
                            {cafe.name}
                          </h3>

                        </div>


                        <p className="cafe-address">
                          {cafe.address ||
                            "Address unavailable"}
                        </p>


                        {cafe.cuisine && (

                          <p className="cafe-description">
                            {cafe.cuisine}
                          </p>

                        )}


                        {cafe.rating && (

                          <div className="cafe-footer">

                            <span>
                              ★ {cafe.rating}
                            </span>

                            {cafe.priceRange && (

                              <span>
                                {cafe.priceRange}
                              </span>

                            )}

                          </div>

                        )}

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


          {/* =========================
              NO CAFES
          ========================= */}

          {!nearbyLoading &&
            cafes.length === 0 && (

              <div className="no-nearby-places">

                <p>
                  No cafés found nearby.
                </p>

              </div>

            )}


          {/* =========================
              HOTELS
          ========================= */}

          {!nearbyLoading &&
            hotels.length > 0 && (

              <div className="trip-place-section">

                <h3 className="trip-place-title">
                  Hotels
                </h3>


                <div className="hotels-grid">

                  {hotels.slice(0, 3).map(
                    (hotel) => (

                      <div
                        className="hotel-card"
                        key={hotel._id || hotel.id}
                      >

                        {placeImages[hotel._id || hotel.id] && (
                          <img
                            src={placeImages[hotel._id || hotel.id]}
                            alt={hotel.name}
                            style={{
                              width: "100%",
                              height: "180px",
                              objectFit: "cover",
                              display: "block",
                              borderRadius: "10px 10px 0 0"
                            }}
                          />
                        )}

                        <div className="hotel-card-top">

                          <h3>
                            {hotel.name}
                          </h3>

                        </div>


                        <p className="hotel-address">
                          {hotel.address ||
                            "Address unavailable"}
                        </p>


                        {hotel.stars && (

                          <p className="hotel-description">
                            {hotel.stars} star hotel
                          </p>

                        )}


                        {hotel.rating && (

                          <div className="hotel-footer">

                            <span>
                              ★ {hotel.rating}
                            </span>

                            {hotel.priceRange && (

                              <span>
                                {hotel.priceRange}
                              </span>

                            )}

                          </div>

                        )}

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


          {/* =========================
              NO HOTELS
          ========================= */}

          {!nearbyLoading &&
            hotels.length === 0 && (

              <div className="no-nearby-places">

                <p>
                  No hotels found nearby.
                </p>

              </div>

            )}

        </section>


        {/* =========================
            BACK BUTTON
        ========================= */}

        <Link
          to="/trips"
          className="back-to-trips"
        >
          ← Back to My Trips
        </Link>


      </main>

    </div>
  );
}

export default TripDetails;