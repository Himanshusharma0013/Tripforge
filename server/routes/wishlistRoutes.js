const express = require("express");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  removeWishlistItem
} = require("../controllers/wishlistController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addToWishlist);

router.get("/", authMiddleware, getWishlist);

// Remove worldwide/custom location
router.delete("/item/:id", authMiddleware, removeWishlistItem);

// Remove normal destination
router.delete("/:destinationId", authMiddleware, removeFromWishlist);

module.exports = router;