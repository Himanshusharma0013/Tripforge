const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true
    },

    description: {
      type: String,
      required: true
    },

    image: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    rating: {
      type: Number,
      default: 4.5
    },

    priceRange: {
      type: String,
      default: "$$"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Hotel", hotelSchema);