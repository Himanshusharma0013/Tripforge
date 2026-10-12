const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: false
    },

    customLocation: {
      name: { type: String },
      country: { type: String },
      city: { type: String },
      displayName: { type: String },
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);