const Expense = require("../models/Expense");
const Trip = require("../models/Trip");

// =========================
// CREATE EXPENSE
// =========================

const createExpense = async (req, res) => {
  try {
    const {
      tripId,
      title,
      amount,
      category,
      date,
      notes
    } = req.body;

    const trip = await Trip.findOne({
      _id: tripId,
      user: req.userId
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    const expense = await Expense.create({
      trip: tripId,
      title,
      amount,
      category,
      date,
      notes
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense
    });

  } catch (error) {
    console.log(
      "CREATE EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create expense",
      error: error.message
    });
  }
};


// =========================
// GET EXPENSES BY TRIP
// =========================

const getExpensesByTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.tripId,
      user: req.userId
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    const expenses = await Expense.find({
      trip: req.params.tripId
    }).sort({
      date: -1,
      createdAt: -1
    });

    res.json(expenses);

  } catch (error) {
    console.log(
      "GET EXPENSES ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch expenses",
      error: error.message
    });
  }
};


// =========================
// UPDATE EXPENSE
// =========================

const updateExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date,
      notes
    } = req.body;

    const expense =
      await Expense.findById(
        req.params.id
      );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    const trip = await Trip.findOne({
      _id: expense.trip,
      user: req.userId
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    expense.title = title;
    expense.amount = amount;
    expense.category = category;
    expense.date = date;
    expense.notes = notes;

    await expense.save();

    res.json({
      message: "Expense updated successfully",
      expense
    });

  } catch (error) {
    console.log(
      "UPDATE EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to update expense",
      error: error.message
    });
  }
};


// =========================
// DELETE EXPENSE
// =========================

const deleteExpense = async (req, res) => {
  try {
    const expense =
      await Expense.findById(
        req.params.id
      );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    const trip = await Trip.findOne({
      _id: expense.trip,
      user: req.userId
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    await Expense.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.log(
      "DELETE EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to delete expense",
      error: error.message
    });
  }
};


module.exports = {
  createExpense,
  getExpensesByTrip,
  updateExpense,
  deleteExpense
};