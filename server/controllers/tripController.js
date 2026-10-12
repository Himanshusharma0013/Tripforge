const Trip = require("../models/Trip");


// ================= CREATE TRIP =================

const createTrip = async (req, res) => {
  try {
    console.log("REQ USER ID:", req.userId);
    console.log("REQ BODY:", req.body);

    const {
      destination,
      customLocation,
      tripName,
      startDate,
      endDate,
      travellers,
      notes
    } = req.body;

    // Must have either an existing destination
    // or a worldwide custom location
    if (!destination && !customLocation) {
      return res.status(400).json({
        message: "Destination or custom location is required."
      });
    }

    const trip = await Trip.create({
      user: req.userId,

      destination: destination || undefined,

      customLocation: customLocation || undefined,

      tripName,
      startDate,
      endDate,
      travellers,
      notes
    });

    console.log("TRIP CREATED:", trip);

    res.status(201).json({
      message: "Trip created successfully",
      trip
    });

  } catch (error) {
    console.log("CREATE TRIP ERROR:", error);

    res.status(500).json({
      message: "Failed to create trip",
      error: error.message
    });
  }
};


// ================= GET MY TRIPS =================

const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      user: req.userId
    }).populate(
      "destination",
      "name country image"
    );

    res.json(trips);

  } catch (error) {
    console.log("GET TRIPS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch trips",
      error: error.message
    });
  }
};


// ================= GET TRIP BY ID =================

const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate(
      "destination",
      "name country image description budget bestTime activities"
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    res.json(trip);

  } catch (error) {
    console.log("GET TRIP ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch trip",
      error: error.message
    });
  }
};


// ================= DELETE TRIP =================

const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    res.json({
      message: "Trip deleted successfully"
    });

  } catch (error) {
    console.log("DELETE TRIP ERROR:", error);

    res.status(500).json({
      message: "Failed to delete trip",
      error: error.message
    });
  }
};


// ================= UPDATE TRIP =================

const updateTrip = async (req, res) => {
  try {
    const {
      tripName,
      startDate,
      endDate,
      travellers,
      notes
    } = req.body;

    const trip = await Trip.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId
      },
      {
        tripName,
        startDate,
        endDate,
        travellers,
        notes
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    res.json({
      message: "Trip updated successfully",
      trip
    });

  } catch (error) {
    console.log("UPDATE TRIP ERROR:", error);

    res.status(500).json({
      message: "Failed to update trip",
      error: error.message
    });
  }
};


module.exports = {
  createTrip,
  getMyTrips,
  getTripById,
  deleteTrip,
  updateTrip
};