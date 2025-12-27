const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        brand: { type: String },
        category: { type: String, required: true },
        barcode: { type: String },
        costPrice: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        gstPercent: { type: Number, default: 0 },
        gstType: { type: String, enum: ['Inclusive', 'Exclusive'], default: 'Inclusive' },
        stockQuantity: { type: Number, required: true },
        unit: { type: String, default: 'Packet' },
        expiryDate: { type: Date, required: true },
        batchNo: { type: String },
        minStockLevel: { type: Number, default: 10 },
        supplier: { type: String },
    },
    { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
