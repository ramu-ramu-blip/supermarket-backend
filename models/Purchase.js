import mongoose from 'mongoose';

const purchaseSchema = mongoose.Schema({
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    invoiceNumber: { type: String, required: true },
    purchaseDate: { type: Date, required: true, default: Date.now },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }, // Quantity purchased
        costPrice: { type: Number, required: true },
        sellingPrice: { type: Number }, // Optional: Update selling price on purchase
        total: { type: Number, required: true }
    }],
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Completed', 'Pending', 'Cancelled'], default: 'Completed' },
    notes: { type: String }
}, {
    timestamps: true
});

export default mongoose.model('Purchase', purchaseSchema);
