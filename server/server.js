const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes");
const tripRoutes = require("./routes/tripRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const cafeRoutes = require("./routes/cafeRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const nearbyRoutes = require("./routes/nearbyRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const aiRoutes = require("./routes/aiRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/cafes", cafeRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/nearby", nearbyRoutes);
app.use( "/api/itinerary", itineraryRoutes);
app.use("/api/expenses",expenseRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/ai", aiRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error);
  });

app.get("/", (req, res) => {
  res.send("TripForge Server is running");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Hello from TripForge Backend"
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});