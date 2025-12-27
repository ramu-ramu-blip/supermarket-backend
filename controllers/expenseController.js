const Expense = require('../models/Expense');

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    try {
        const { reason, amount, date } = req.body;

        const expense = await Expense.create({
            reason,
            amount,
            date: date || Date.now(),
            user: req.user._id
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { user: req.user._id };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const expenses = await Expense.find(query).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addExpense,
    getExpenses
};
