const express = require("express");

const {
  createTrip,
  getMyTrips,
  getTripById,
  deleteTrip,
  updateTrip
} = require("../controllers/tripController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createTrip);

router.get("/my-trips", authMiddleware, getMyTrips);

router.get("/:id", authMiddleware, getTripById);

router.delete("/:id", authMiddleware, deleteTrip);

router.put("/:id", authMiddleware, updateTrip);

module.exports = router;