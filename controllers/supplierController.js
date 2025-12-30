import Supplier from '../models/Supplier.js';

const getSuppliers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { contactPerson: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        const suppliers = await Supplier.find(query);
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json({ message: 'Supplier deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getSuppliers, createSupplier, updateSupplier, deleteSupplier };
