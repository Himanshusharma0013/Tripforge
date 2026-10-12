import { useEffect, useState, useRef } from "react";

import { FiEye, FiEyeOff } from "react-icons/fi";

import {

  Routes,

  Route,

  Link,

  useNavigate,

  useLocation

} from "react-router-dom";

import "./App.css";

import DestinationDetails from "./DestinationDetails";

import TripDetails from "./pages/TripDetails";

import MyTrips from "./MyTrips";

import About from "./pages/About";

import LocationDetails from "./pages/LocationDetails";

import Wishlist from "./pages/Wishlist";
import AITripPlanner from "./pages/AITripPlanner";

const heroClips = [

  {

    src: "/videos/mountains.mp4",

    label: "MOUNTAINS"

  },

  {

    src: "/videos/beach.mp4",

    label: "BEACH"

  },

  {

    src: "/videos/city.mp4",

    label: "CITY"

  },

  {

    src: "/videos/tropical.mp4",

    label: "TROPICAL"

  },

  {

    src: "/videos/desert.mp4",

    label: "DESERT"

  }

];

function Home() {

  const [destinations, setDestinations] = useState([]);

  const [search, setSearch] = useState("");

  const [locationResults, setLocationResults] = useState([]);

  const [searchingLocations, setSearchingLocations] = useState(false);

  const searchTimer = useRef(null);

  const [showLogin, setShowLogin] = useState(false);

  const [showRegister, setShowRegister] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [name, setName] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");

  const [registerPassword, setRegisterPassword] = useState("");

  const [loginMessage, setLoginMessage] = useState("");

  const [registerMessage, setRegisterMessage] = useState("");

  const location = useLocation();

  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(

    !!localStorage.getItem("token")

  );

  const [user, setUser] = useState(null);

  // Mobile menu

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Wishlist

  const [wishlistIds, setWishlistIds] = useState([]);

  // Hero video carousel

  const [activeHeroClip, setActiveHeroClip] = useState(0);

  // Fetch destinations

  useEffect(() => {

    fetch("http://localhost:5000/api/destinations")

      .then((response) => response.json())

      .then((data) => {

        setDestinations(data);

      })

      .catch((error) => {

        console.log(error);

      });

  }, []);

  // Get logged-in user

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {

      return;

    }

    fetch("http://localhost:5000/api/users/profile", {

      headers: {

        Authorization: `Bearer ${token}`

      }

    })

      .then((response) => response.json())

      .then((data) => {

        if (data.user) {

          setUser(data.user);

          setIsLoggedIn(true);

        }

      })

      .catch((error) => {

        console.log(error);

      });

  }, []);

  // Fetch wishlist

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {

      setWishlistIds([]);

      return;

    }

    fetch("http://localhost:5000/api/wishlist", {

      headers: {

        Authorization: `Bearer ${token}`

      }

    })

      .then((response) => response.json())

      .then((data) => {

        if (Array.isArray(data)) {

          setWishlistIds(

            data

              .filter((item) => item.destination)

              .map((item) => item.destination._id)

          );

        }

      })

      .catch((error) => {

        console.log("GET WISHLIST ERROR:", error);

      });

  }, [isLoggedIn]);

  // Hero video changes every 5 seconds

  useEffect(() => {

    const heroTimer = setInterval(() => {

      setActiveHeroClip((previous) =>

        (previous + 1) % heroClips.length

      );

    }, 5000);

    return () => clearInterval(heroTimer);

  }, []);

  // Search

  const filteredDestinations = destinations.filter((destination) => {

    const searchText = search.toLowerCase();

    return (

      destination.name.toLowerCase().includes(searchText) ||

      destination.country.toLowerCase().includes(searchText)

    );

  });

  // Worldwide location search

  const searchWorldwide = (query) => {

    clearTimeout(searchTimer.current);

    if (query.trim().length < 3) {

      setLocationResults([]);

      setSearchingLocations(false);

      return;

    }

    setSearchingLocations(true);

    searchTimer.current = setTimeout(async () => {

      try {

        const response = await fetch(

          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(

            query

          )}&limit=5&addressdetails=1`

        );

        const data = await response.json();

        setLocationResults(data);

      } catch (error) {

        console.log("Worldwide search error:", error);

        setLocationResults([]);

      }

      setSearchingLocations(false);

    }, 700);

  };

  // Login

  const handleLogin = async (event) => {

    event.preventDefault();

    try {

      const response = await fetch(

        "http://localhost:5000/api/users/login",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json"

          },

          body: JSON.stringify({

            email,

            password

          })

        }

      );

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem("token", data.token);

        setIsLoggedIn(true);

        setUser(data.user);

        setLoginMessage("Login successful!");

        setTimeout(() => {

          setShowLogin(false);

          setLoginMessage("");

          setEmail("");

          setPassword("");

        }, 1000);

      } else {

        setLoginMessage(data.message || "Login failed");

      }

    } catch (error) {

      setLoginMessage("Server error. Please try again.");

    }

  };

  // Register

  const handleRegister = async (event) => {

    event.preventDefault();

    try {

      const response = await fetch(

        "http://localhost:5000/api/users/register",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json"

          },

          body: JSON.stringify({

            name,

            email: registerEmail,

            password: registerPassword

          })

        }

      );

      const data = await response.json();

      if (response.ok) {

        setRegisterMessage("Account created successfully!");

        setTimeout(() => {

          setShowRegister(false);

          setShowLogin(true);

          setRegisterMessage("");

          setName("");

          setRegisterEmail("");

          setRegisterPassword("");

        }, 1000);

      } else {

        setRegisterMessage(

          data.message || "Registration failed"

        );

      }

    } catch (error) {

      setRegisterMessage("Server error. Please try again.");

    }

  };

  // Toggle wishlist

  const toggleWishlist = async (destinationId) => {

    const token = localStorage.getItem("token");

    if (!token) {

      setShowLogin(true);

      setLoginMessage("Please login to use your wishlist.");

      return;

    }

    const isSaved = wishlistIds.includes(destinationId);

    try {

      const response = await fetch(

        isSaved

          ? `http://localhost:5000/api/wishlist/${destinationId}`

          : "http://localhost:5000/api/wishlist",

        {

          method: isSaved ? "DELETE" : "POST",

          headers: {

            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`

          },

          ...(isSaved

            ? {}

            : {

                body: JSON.stringify({

                  destinationId

                })

              })

        }

      );

      const data = await response.json();

      if (!response.ok) {

        console.log(data);

        return;

      }

      setWishlistIds((previous) =>

        isSaved

          ? previous.filter((id) => id !== destinationId)

          : [...previous, destinationId]

      );

    } catch (error) {

      console.log("TOGGLE WISHLIST ERROR:", error);

    }

  };

  // Logout

  const handleLogout = () => {

    localStorage.removeItem("token");

    setIsLoggedIn(false);

    setUser(null);

    setWishlistIds([]);

    setMobileMenuOpen(false);

  };

  // Open register

  const openRegister = () => {

    setShowLogin(false);

    setShowRegister(true);

    setLoginMessage("");

  };

  // Open login

  const openLogin = () => {

    setShowRegister(false);

    setShowLogin(true);

    setRegisterMessage("");

  };

  return (

    <div className="app">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <Link

          to="/"

          className="logo"

          onClick={() => setMobileMenuOpen(false)}

        >

          TripForge

        </Link>

        {/* Desktop Navigation */}

        <div className="nav-links desktop-nav">

          <a href="#destinations">

            Explore

          </a>

          <Link to="/trips">

            Trips

          </Link>

          <Link to="/ai-planner">AI Planner</Link>

          <Link to="/wishlist">

            Wishlist

          </Link>

          <Link to="/about">

            About

          </Link>

        </div>

        {/* Desktop Login / Logout */}

        {isLoggedIn ? (

          <div className="user-section desktop-auth">

            <span className="user-name">

              {user ? user.name : "User"}

            </span>

            <button

              className="login-button"

              onClick={handleLogout}

            >

              Logout

            </button>

          </div>

        ) : (

          <button

            className="login-button desktop-auth"

            onClick={() => setShowLogin(true)}

          >

            Login

          </button>

        )}

        {/* ================= MOBILE MENU BUTTON ================= */}

        <button

          className="mobile-menu-button"

          onClick={() =>

            setMobileMenuOpen(!mobileMenuOpen)

          }

          aria-label="Open navigation menu"

        >

          {mobileMenuOpen ? "✕" : "☰"}

        </button>

        {/* ================= MOBILE DROPDOWN ================= */}

        {mobileMenuOpen && (

          <div className="mobile-menu">

            <a

              href="#destinations"

              onClick={() =>

                setMobileMenuOpen(false)

              }

            >

              Explore

            </a>

            <Link

              to="/trips"

              onClick={() =>

                setMobileMenuOpen(false)

              }

            >

              My Trips

            </Link>

            <Link to="/ai-planner" onClick={() => setMobileMenuOpen(false)}>AI Planner</Link>

            <Link

              to="/wishlist"

              onClick={() =>

                setMobileMenuOpen(false)

              }

            >

              Wishlist

            </Link>

            <Link

              to="/about"

              onClick={() =>

                setMobileMenuOpen(false)

              }

            >

              About

            </Link>

            {isLoggedIn ? (

              <button

                className="mobile-logout"

                onClick={handleLogout}

              >

                Logout

              </button>

            ) : (

              <button

                className="mobile-login"

                onClick={() => {

                  setMobileMenuOpen(false);

                  setShowLogin(true);

                }}

              >

                Login

              </button>

            )}

          </div>

        )}

      </nav>

      {/* ================= MAIN ================= */}

      <main>

        {/* Hero */}

        <section className="hero">

          <div className="hero-video">

            <video

              key={heroClips[activeHeroClip].src}

              className="hero-video-media"

              src={heroClips[activeHeroClip].src}

              autoPlay

              muted

              playsInline

              onEnded={() =>

                setActiveHeroClip(

                  (previous) =>

                    (previous + 1) % heroClips.length

                )

              }

            />

            <div className="hero-video-overlay" />

            <div className="hero-video-vignette" />

            <div className="hero-content">

              <p className="hero-label">

                TRAVEL DIFFERENT

              </p>

              <h1>

                Your next

                <br />

                adventure starts here.

              </h1>

              <p className="hero-text">

                Discover places worth visiting, plan better trips and keep

                everything you need in one place.

              </p>

              <a

                href="#destinations"

                className="explore-button"

              >

                Explore destinations

              </a>

            </div>

            <div className="hero-dots">

              {heroClips.map((clip, index) => (

                <button

                  key={clip.src}

                  type="button"

                  className={

                    `hero-dot ${

                      activeHeroClip === index

                        ? "active"

                        : ""

                    }`

                  }

                  onClick={() =>

                    setActiveHeroClip(index)

                  }

                  aria-label={`Show ${clip.label.toLowerCase()} clip`}

                >

                  <span />

                </button>

              ))}

            </div>

          </div>

        </section>

        {/* Destinations */}

        <section

          id="destinations"

          className="destinations-section"

        >

          <div className="section-heading">

            <div>

              <p className="section-label">

                DISCOVER

              </p>

              <h2>

                Featured destinations

              </h2>

            </div>

            <p className="destination-count">

              {filteredDestinations.length} destination

              {filteredDestinations.length !== 1

                ? "s"

                : ""}

            </p>

          </div>

          {/* Search */}

          <div className="search-box">

            <input

              type="text"

              placeholder="Search any location worldwide..."

              value={search}

              onChange={(event) => {

                const value = event.target.value;

                setSearch(value);

                searchWorldwide(value);

              }}

            />

          </div>

          {searchingLocations && (

            <p className="search-status">Searching...</p>

          )}

          {locationResults.length > 0 && (

            <div className="location-results">

              {locationResults.map((location) => (

                <div

                  className="location-result"

                  key={location.place_id}

                  onClick={() => {

                    navigate("/location", {

                      state: {

                        place: location

                      }

                    });

                    setSearch("");

                    setLocationResults([]);

                  }}

                >

                  <strong>

                    {location.name || location.display_name}

                  </strong>

                  <span>

                    {location.display_name}

                  </span>

                </div>

              ))}

            </div>

          )}

          {/* Destination Cards */}

          <div className="destination-grid">

            {filteredDestinations.map((destination) => (

              <article

                className="destination-card"

                key={destination._id}

              >

                <div

                  className="image-container"

                  style={{ position: "relative" }}

                >

                  <img

                    src={destination.image}

                    alt={destination.name}

                  />

                  <button

                    type="button"

                    onClick={() => toggleWishlist(destination._id)}

                    aria-label={

                      wishlistIds.includes(destination._id)

                        ? `Remove ${destination.name} from wishlist`

                        : `Add ${destination.name} to wishlist`

                    }

                    style={{

                      position: "absolute",

                      top: "14px",

                      right: "14px",

                      width: "42px",

                      height: "42px",

                      borderRadius: "50%",

                      border: "1px solid rgba(255,255,255,0.25)",

                      background: "rgba(10, 15, 20, 0.72)",

                      color: wishlistIds.includes(destination._id)

                        ? "#ff5c7a"

                        : "#ffffff",

                      fontSize: "25px",

                      lineHeight: "1",

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      cursor: "pointer",

                      zIndex: 10,

                      backdropFilter: "blur(6px)"

                    }}

                  >

                    {wishlistIds.includes(destination._id) ? "♥" : "♡"}

                  </button>

                </div>

                <div className="card-content">

                  <h3>

                    {destination.name}

                  </h3>

                  <p className="country">

                    {destination.country}

                  </p>

                  <p className="description">

                    {destination.description}

                  </p>

                  <div className="card-footer">

                    <span>

                      From ₹{destination.budget}

                    </span>

                    <Link

                      to={`/destinations/${destination._id}`}

                    >

                      View trip →

                    </Link>

                  </div>

                </div>

              </article>

            ))}

          </div>

          {filteredDestinations.length === 0 &&

            search.trim() !== "" &&

            locationResults.length === 0 &&

            !searchingLocations && (

              <p className="no-results">

                No destinations found.

              </p>

            )}

        </section>

      </main>

      {/* ================= LOGIN MODAL ================= */}

      {showLogin && (

        <div

          className="login-overlay"

          onClick={() => setShowLogin(false)}

        >

          <div

            className="login-modal"

            onClick={(event) =>

              event.stopPropagation()

            }

          >

            <button

              className="close-login"

              onClick={() =>

                setShowLogin(false)

              }

            >

              ×

            </button>

            <p className="section-label">

              WELCOME BACK

            </p>

            <h2>

              Login to TripForge

            </h2>

            <p className="login-subtitle">

              Continue planning your next adventure.

            </p>

            <form onSubmit={handleLogin}>

              <label>

                Email

              </label>

              <input

                type="email"

                placeholder="you@example.com"

                value={email}

                onChange={(event) =>

                  setEmail(event.target.value)

                }

                required

              />

              <label>

                Password

              </label>

              <div className="password-field">

                <input

                  type={

                    showPassword

                      ? "text"

                      : "password"

                  }

                  placeholder="••••••••"

                  value={password}

                  onChange={(event) =>

                    setPassword(event.target.value)

                  }

                  required

                />

                <button

                  type="button"

                  className="password-toggle"

                  onClick={() =>

                    setShowPassword(!showPassword)

                  }

                >

                  {showPassword ? (

                    <FiEyeOff size={20} />

                  ) : (

                    <FiEye size={20} />

                  )}

                </button>

              </div>

              <button

                type="submit"

                className="login-submit"

              >

                Login

              </button>

            </form>

            {loginMessage && (

              <p className="login-message">

                {loginMessage}

              </p>

            )}

            <p className="auth-switch">

              Don't have an account?{" "}

              <button onClick={openRegister}>

                Create account

              </button>

            </p>

          </div>

        </div>

      )}

      {/* ================= REGISTER MODAL ================= */}

      {showRegister && (

        <div

          className="login-overlay"

          onClick={() =>

            setShowRegister(false)

          }

        >

          <div

            className="login-modal"

            onClick={(event) =>

              event.stopPropagation()

            }

          >

            <button

              className="close-login"

              onClick={() =>

                setShowRegister(false)

              }

            >

              ×

            </button>

            <p className="section-label">

              GET STARTED

            </p>

            <h2>

              Create your account

            </h2>

            <p className="login-subtitle">

              Start planning your next adventure.

            </p>

            <form onSubmit={handleRegister}>

              <label>

                Name

              </label>

              <input

                type="text"

                placeholder="Your name"

                value={name}

                onChange={(event) =>

                  setName(event.target.value)

                }

                required

              />

              <label>

                Email

              </label>

              <input

                type="email"

                placeholder="you@example.com"

                value={registerEmail}

                onChange={(event) =>

                  setRegisterEmail(event.target.value)

                }

                required

              />

              <label>

                Password

              </label>

              <div className="password-field">

                <input

                  type={

                    showRegisterPassword

                      ? "text"

                      : "password"

                  }

                  placeholder="••••••••"

                  value={registerPassword}

                  onChange={(event) =>

                    setRegisterPassword(

                      event.target.value

                    )

                  }

                  required

                />

                <button

                  type="button"

                  className="password-toggle"

                  onClick={() =>

                    setShowRegisterPassword(

                      !showRegisterPassword

                    )

                  }

                >

                  {showRegisterPassword ? (

                    <FiEyeOff size={20} />

                  ) : (

                    <FiEye size={20} />

                  )}

                </button>

              </div>

              <button

                type="submit"

                className="login-submit"

              >

                Create account

              </button>

            </form>

            {registerMessage && (

              <p className="login-message">

                {registerMessage}

              </p>

            )}

            <p className="auth-switch">

              Already have an account?{" "}

              <button onClick={openLogin}>

                Login

              </button>

            </p>

          </div>

        </div>

      )}

    </div>

  );

}

/* ================= ROUTES ================= */

function App() {

  return (

    <Routes>

      <Route

        path="/"

        element={<Home />}

      />

      <Route

        path="/location"

        element={<LocationDetails />}

      />

      <Route

        path="/destinations/:id"

        element={<DestinationDetails />}

      />

      <Route

        path="/trips"

        element={<MyTrips />}

      />

      <Route

        path="/trips/:id"

        element={<TripDetails />}

      />

      <Route path="/about"

        element={<About />}

      />

      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/ai-planner" element={<AITripPlanner />} />

    </Routes>

  );

}

export default App;
