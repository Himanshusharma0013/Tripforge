const express = require("express");

const {
  getNearbyPlaces
} = require("../controllers/nearbyController");

const router = express.Router();

router.get(
  "/",
  getNearbyPlaces
);

module.exports = router;