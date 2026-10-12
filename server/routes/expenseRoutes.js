const express = require("express");

const {
  createExpense,
  getExpensesByTrip,
  updateExpense,
  deleteExpense
} = require("../controllers/expenseController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add expense
router.post(
  "/",
  authMiddleware,
  createExpense
);

// Get expenses for a trip
router.get(
  "/trip/:tripId",
  authMiddleware,
  getExpensesByTrip
);

// Update expense
router.put(
  "/:id",
  authMiddleware,
  updateExpense
);

// Delete expense
router.delete(
  "/:id",
  authMiddleware,
  deleteExpense
);

module.exports = router;