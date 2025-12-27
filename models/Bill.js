const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
    {
        invoiceNumber: { type: String, required: true, unique: true },
        customerName: { type: String },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                name: { type: String },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                gst: { type: Number, default: 0 },
                total: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        gstAmount: { type: Number, required: true },
        discountAmount: { type: Number, default: 0 },
        netAmount: { type: Number, required: true },
        paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Other'], default: 'Cash' },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
