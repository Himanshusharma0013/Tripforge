const Wishlist = require("../models/Wishlist");
const Destination = require("../models/Destination");

// Add destination or worldwide location to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { destinationId, customLocation } = req.body;

    // Existing MongoDB destination
    if (destinationId) {
      const destination = await Destination.findById(destinationId);

      if (!destination) {
        return res.status(404).json({
          message: "Destination not found"
        });
      }

      const alreadyExists = await Wishlist.findOne({
        user: req.userId,
        destination: destinationId
      });

      if (alreadyExists) {
        return res.status(400).json({
          message: "Destination already in wishlist"
        });
      }

      const wishlistItem = await Wishlist.create({
        user: req.userId,
        destination: destinationId
      });

      return res.status(201).json(wishlistItem);
    }

    // Worldwide searched location
    if (customLocation) {
      if (!customLocation.name) {
        return res.status(400).json({
          message: "Location name is required"
        });
      }

      const alreadyExists = await Wishlist.findOne({
        user: req.userId,
        "customLocation.name": customLocation.name,
        "customLocation.latitude": customLocation.latitude,
        "customLocation.longitude": customLocation.longitude
      });

      if (alreadyExists) {
        return res.status(400).json({
          message: "Location already in wishlist"
        });
      }

      const wishlistItem = await Wishlist.create({
        user: req.userId,
        customLocation: {
          name: customLocation.name,
          country: customLocation.country || "",
          city: customLocation.city || "",
          displayName: customLocation.displayName || "",
          latitude: Number(customLocation.latitude),
          longitude: Number(customLocation.longitude)
        }
      });

      return res.status(201).json(wishlistItem);
    }

    return res.status(400).json({
      message: "Destination or location is required"
    });
  } catch (error) {
    console.log("ADD WISHLIST ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.userId
    }).populate("destination");

    res.json(wishlist);
  } catch (error) {
    console.log("GET WISHLIST ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// Remove destination or worldwide location from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({
      user: req.userId,
      destination: destinationId
    });

    if (!wishlistItem) {
      return res.status(404).json({
        message: "Destination not found in wishlist"
      });
    }

    res.json({
      message: "Removed from wishlist"
    });
  } catch (error) {
    console.log("REMOVE WISHLIST ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// Remove any wishlist item by wishlist item ID
const removeWishlistItem = async (req, res) => {
  try {
    const { id } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({
      _id: id,
      user: req.userId
    });

    if (!wishlistItem) {
      return res.status(404).json({
        message: "Wishlist item not found"
      });
    }

    res.json({
      message: "Removed from wishlist"
    });
  } catch (error) {
    console.log("REMOVE WISHLIST ITEM ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  removeWishlistItem
};