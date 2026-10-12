const express = require("express");

const {
  getAllHotels,
  getHotelsByDestination
} = require("../controllers/hotelController");

const router = express.Router();

router.get("/", getAllHotels);

router.get(
  "/destination/:destinationId",
  getHotelsByDestination
);

module.exports = router;