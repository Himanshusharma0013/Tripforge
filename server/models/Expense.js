const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    category: {
      type: String,
      enum: [
        "Hotel",
        "Food",
        "Transport",
        "Activities",
        "Shopping",
        "Other"
      ],
      default: "Other"
    },

    date: {
      type: Date,
      default: Date.now
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

module.exports = mongoose.model(
  "Expense",
  expenseSchema
);