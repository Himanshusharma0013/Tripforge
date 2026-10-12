const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Existing MongoDB destinations
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: false
    },

    // Worldwide searched locations
    customLocation: {
      name: {
        type: String
      },

      country: {
        type: String
      },

      city: {
        type: String
      },

      displayName: {
        type: String
      },

      latitude: {
        type: Number
      },

      longitude: {
        type: Number
      }
    },

    tripName: {
      type: String,
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    travellers: {
      type: Number,
      required: true,
      min: 1
    },

    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Trip", tripSchema);