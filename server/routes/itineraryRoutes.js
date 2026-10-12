const express = require("express");

const {
  createItinerary,
  getItineraryByTrip,
  updateItinerary,
  deleteItinerary
} = require("../controllers/itineraryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add itinerary activity
router.post(
  "/",
  authMiddleware,
  createItinerary
);

// Get itinerary for a trip
router.get(
  "/trip/:tripId",
  authMiddleware,
  getItineraryByTrip
);

// Update itinerary activity
router.put(
  "/:id",
  authMiddleware,
  updateItinerary
);

// Delete itinerary activity
router.delete(
  "/:id",
  authMiddleware,
  deleteItinerary
);

module.exports = router;