
import { Link } from "react-router-dom";

function About() {
  const features = [
    {
      number: "01",
      title: "Discover destinations",
      description:
        "Explore destinations around the world, discover popular attractions, learn about the best time to visit and plan around your travel budget."
    },
    {
      number: "02",
      title: "AI Trip Planner",
      description:
        "Generate personalized, day-wise travel itineraries based on your destination, travel dates, budget and interests. Use AI suggestions as a starting reference for your trip."
    },
    {
      number: "03",
      title: "Manage your trips",
      description:
        "Create and organize trips, manage travel dates and traveller details, update trip information and keep your plans in one place."
    },
    {
      number: "04",
      title: "Plan your itinerary",
      description:
        "Organize activities day by day and keep track of the places and experiences you want to include in your journey."
    },
    {
      number: "05",
      title: "Track your travel budget",
      description:
        "Record travel expenses, monitor total spending and organize costs to keep your trip finances easier to manage."
    },
    {
      number: "06",
      title: "Explore cafés and hotels",
      description:
        "Discover nearby cafés and hotels around your selected destination to help plan where to eat and stay."
    },
    {
      number: "07",
      title: "Save your favourites",
      description:
        "Keep interesting destinations and places in your wishlist so you can revisit them while planning future journeys."
    }
  ];

  return (
    <div className="about-page">
      <nav className="navbar">
        <Link to="/" className="logo">
          TripForge
        </Link>

        <div className="nav-links">
          <Link to="/#destinations">Explore</Link>
          <Link to="/trips">Trips</Link>
          <Link to="/about">About</Link>
        </div>

        <Link
          to="/"
          className="login-button detail-home-button"
        >
          Home
        </Link>
      </nav>

      <main className="about-container">
        <header className="about-header">
          <p className="about-label">ABOUT TRIPFORGE</p>

          <h1>
            Travel better.
            <br />
            <span>Plan smarter.</span>
          </h1>

          <p className="about-intro">
            TripForge brings destination discovery, AI-assisted
            itinerary planning and trip management together
            to make organizing your next journey simpler.
          </p>
        </header>

        <section className="about-section">
          <p className="about-label">WHAT WE OFFER</p>

          <div className="about-features">
            {features.map((feature) => (
              <article
                className="about-feature-card"
                key={feature.number}
              >
                <span className="about-number">
                  {feature.number}
                </span>

                <h2>{feature.title}</h2>

                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-mission">
          <p className="about-label">OUR PURPOSE</p>

          <h2>
            Your travel plans, all in one place.
          </h2>

          <p>
            From discovering destinations to organizing
            itineraries and tracking expenses, TripForge
            helps bring the important parts of travel
            planning together in one place.
          </p>
        </section>

        <section className="about-cta">
          <div>
            <p className="about-label">READY TO EXPLORE?</p>

            <h2>Start planning your next trip.</h2>
          </div>

          <Link
            to="/#destinations"
            className="about-explore-button"
          >
            Explore destinations →
          </Link>
        </section>
      </main>
    </div>
  );
}

export default About;
