const Itinerary = require("../models/Itinerary");
const Trip = require("../models/Trip");

// =========================
// CREATE ITINERARY
// =========================

const createItinerary = async (req, res) => {
  try {
    const {
      tripId,
      day,
      title,
      description,
      time
    } = req.body;

    const trip = await Trip.findOne({
      _id: tripId,
      user: req.userId
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    const itinerary = await Itinerary.create({
      trip: tripId,
      day,
      title,
      description,
      time
    });

    res.status(201).json({
      message: "Itinerary added successfully",
      itinerary
    });

  } catch (error) {
    console.log(
      "CREATE ITINERARY ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create itinerary",
      error: error.message
    });
  }
};


// =========================
// GET ITINERARY BY TRIP
// =========================

const getItineraryByTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.tripId,
      user: req.userId
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    const itinerary = await Itinerary.find({
      trip: req.params.tripId
    }).sort({
      day: 1,
      time: 1,
      createdAt: 1
    });

    res.json(itinerary);

  } catch (error) {
    console.log(
      "GET ITINERARY ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch itinerary",
      error: error.message
    });
  }
};


// =========================
// UPDATE ITINERARY
// =========================

const updateItinerary = async (req, res) => {
  try {
    const {
      day,
      title,
      description,
      time
    } = req.body;

    const itinerary =
      await Itinerary.findById(
        req.params.id
      );

    if (!itinerary) {
      return res.status(404).json({
        message: "Itinerary not found"
      });
    }

    const trip = await Trip.findOne({
      _id: itinerary.trip,
      user: req.userId
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    itinerary.day = day;
    itinerary.title = title;
    itinerary.description = description;
    itinerary.time = time;

    await itinerary.save();

    res.json({
      message: "Itinerary updated successfully",
      itinerary
    });

  } catch (error) {
    console.log(
      "UPDATE ITINERARY ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to update itinerary",
      error: error.message
    });
  }
};


// =========================
// DELETE ITINERARY
// =========================

const deleteItinerary = async (req, res) => {
  try {
    const itinerary =
      await Itinerary.findById(
        req.params.id
      );

    if (!itinerary) {
      return res.status(404).json({
        message: "Itinerary not found"
      });
    }

    const trip = await Trip.findOne({
      _id: itinerary.trip,
      user: req.userId
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    await Itinerary.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Itinerary deleted successfully"
    });

  } catch (error) {
    console.log(
      "DELETE ITINERARY ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to delete itinerary",
      error: error.message
    });
  }
};


module.exports = {
  createItinerary,
  getItineraryByTrip,
  updateItinerary,
  deleteItinerary
};