const express = require("express");

const {
  getDestinations,
  getDestinationById,
  createDestination
} = require("../controllers/destinationController");

const router = express.Router();

router.get("/", getDestinations);
router.get("/:id", getDestinationById);
router.post("/", createDestination);

module.exports = router;