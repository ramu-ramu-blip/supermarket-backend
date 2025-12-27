const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: [true, 'Please add a reason for the expense'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
        min: [0, 'Amount cannot be negative']
    },
    date: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
