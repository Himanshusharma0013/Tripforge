import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Wishlist.css";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  // ==========================================
  // FETCH WISHLIST
  // ==========================================

  const fetchWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setWishlist(data);

      } else {
        console.log(data);
      }
    } catch (error) {
      console.log("GET WISHLIST ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REMOVE NORMAL DESTINATION OR WORLDWIDE
  // ==========================================

  const removeFromWishlist = async (item) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      let url;

      // Worldwide location
      if (item.customLocation) {
        url = `http://localhost:5000/api/wishlist/item/${item._id}`;
      }

      // Normal MongoDB destination
      else if (item.destination) {
        url = `http://localhost:5000/api/wishlist/${item.destination._id}`;
      }

      else {
        return;
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setWishlist((previous) =>
          previous.filter(
            (wishlistItem) =>
              wishlistItem._id !== item._id
          )
        );
      } else {
        console.log(data);
      }
    } catch (error) {
      console.log("REMOVE WISHLIST ERROR:", error);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="wishlist-page">

      <div className="wishlist-container">

        <p className="section-label">
          YOUR SAVED PLACES
        </p>

        <h1>Wishlist</h1>

        <p className="wishlist-subtitle">
          Keep the destinations you want to explore next in one place.
        </p>

        <div className="wishlist-back-wrapper">
          <Link
            to="/"
            className="wishlist-back-button"
          >
            ← Back to Explore
          </Link>
        </div>

        {wishlist.length === 0 ? (

          <div className="wishlist-empty">

            <h2>Your wishlist is empty</h2>

            <p>
              Save destinations you want to visit and they will appear here.
            </p>

            <Link
              to="/"
              className="explore-button"
            >
              Explore destinations
            </Link>

          </div>

        ) : (

          <div className="wishlist-grid">

            {wishlist.map((item) => {

              // ==========================================
              // NORMAL DESTINATION
              // ==========================================

              if (item.destination) {
                const destination = item.destination;

                return (
                  <div
                    className="wishlist-card"
                    key={item._id}
                  >

                    <img
                      src={destination.image}
                      alt={destination.name}
                    />

                    <div className="wishlist-card-content">

                      <div>

                        <p className="wishlist-country">
                          {destination.country}
                        </p>

                        <h2>
                          {destination.name}
                        </h2>

                        <p>
                          {destination.description}
                        </p>

                      </div>

                      <div className="wishlist-card-actions">

                        <Link
                          to={`/destinations/${destination._id}`}
                          className="wishlist-view-button"
                        >
                          View destination
                        </Link>

                        <button
                          type="button"
                          className="wishlist-remove-button"
                          onClick={() =>
                            removeFromWishlist(item)
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }

              // ==========================================
              // WORLDWIDE LOCATION
              // ==========================================

              if (item.customLocation) {
                const location = item.customLocation;

                return (
                  <div
                    className="wishlist-card worldwide-wishlist-card"
                    key={item._id}
                  >

                    <div className="worldwide-location-image">

                      <span>
                        WORLDWIDE
                      </span>

                      <strong>
                        {location.name}
                      </strong>

                    </div>

                    <div className="wishlist-card-content">

                      <div>

                        <p className="wishlist-country">
                          {location.country || "Worldwide"}
                        </p>

                        <h2>
                          {location.name}
                        </h2>

                      </div>

                      <div className="wishlist-card-actions">

                        <Link
                          to="/location"
                          state={{
                            place: {
                              name: location.name,
                              display_name: location.displayName,
                              lat: location.latitude,
                              lon: location.longitude,
                              address: {
                                city: location.city,
                                country: location.country
                              }
                            }
                          }}
                          className="wishlist-view-button"
                        >
                          View destination
                        </Link>

                        <button
                          type="button"
                          className="wishlist-remove-button"
                          onClick={() =>
                            removeFromWishlist(item)
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }

              return null;
            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default Wishlist;