const express = require("express");

const {
  getAllCafes,
  getCafesByDestination
} = require("../controllers/cafeController");

const router = express.Router();

router.get("/", getAllCafes);

router.get(
  "/destination/:destinationId",
  getCafesByDestination
);

module.exports = router;