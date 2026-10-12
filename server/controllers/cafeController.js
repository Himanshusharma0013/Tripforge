const Cafe = require("../models/Cafe");

// Get all cafes
const getAllCafes = async (req, res) => {
  try {
    const cafes = await Cafe.find()
      .populate("destination", "name country");

    res.json(cafes);

  } catch (error) {
    console.log("GET CAFES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch cafes",
      error: error.message
    });
  }
};


// Get cafes by destination
const getCafesByDestination = async (req, res) => {
  try {
    const cafes = await Cafe.find({
      destination: req.params.destinationId
    }).populate("destination", "name country");

    res.json(cafes);

  } catch (error) {
    console.log(
      "GET CAFES BY DESTINATION ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch cafes",
      error: error.message
    });
  }
};


module.exports = {
  getAllCafes,
  getCafesByDestination
};