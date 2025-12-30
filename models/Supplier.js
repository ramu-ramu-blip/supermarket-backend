import mongoose from 'mongoose';

const supplierSchema = mongoose.Schema({
    name: { type: String, required: true },
    contactPerson: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    gstin: { type: String }, // Tax ID
}, {
    timestamps: true
});

export default mongoose.model('Supplier', supplierSchema);
