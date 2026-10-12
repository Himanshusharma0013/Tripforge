const Hotel = require("../models/Hotel");

// Get all hotels
const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate("destination", "name country");

    res.json(hotels);

  } catch (error) {
    console.log("GET HOTELS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch hotels",
      error: error.message
    });
  }
};


// Get hotels by destination
const getHotelsByDestination = async (req, res) => {
  try {
    const hotels = await Hotel.find({
      destination: req.params.destinationId
    }).populate("destination", "name country");

    res.json(hotels);

  } catch (error) {
    console.log(
      "GET HOTELS BY DESTINATION ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch hotels",
      error: error.message
    });
  }
};


module.exports = {
  getAllHotels,
  getHotelsByDestination
};