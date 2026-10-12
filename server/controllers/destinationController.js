const Destination = require("../models/Destination");

const getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find();

    res.json(destinations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch destinations",
      error: error.message
    });
  }
};

const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found"
      });
    }

    res.json(destination);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch destination",
      error: error.message
    });
  }
};

const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);

    res.status(201).json(destination);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create destination",
      error: error.message
    });
  }
};

module.exports = {
  getDestinations,
  getDestinationById,
  createDestination
};