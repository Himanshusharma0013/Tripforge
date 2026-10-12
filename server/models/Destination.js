const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    country: {
      type: String,
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

    budget: {
      type: Number,
      required: true
    },

    bestTime: {
      type: String,
      required: true
    },

    activities: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Destination", destinationSchema);