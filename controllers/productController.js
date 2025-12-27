const Product = require('../models/Product');

const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExpiringProducts = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        const products = await Product.find({
            expiryDate: { $gte: today, $lte: thirtyDaysLater }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const fs = require('fs');
const csv = require('csv-parser');

const bulkImportProducts = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Map CSV data tochema (assuming CSV headers match schema keys or need mapping)
                // Minimal mapping assuming headers: name, category, costPrice, sellingPrice, stockQuantity, expiryDate
                const productsToInsert = results.map(row => ({
                    name: row.name,
                    brand: row.brand,
                    category: row.category,
                    barcode: row.barcode,
                    costPrice: Number(row.costPrice),
                    sellingPrice: Number(row.sellingPrice),
                    gstPercent: Number(row.gstPercent) || 0,
                    gstType: row.gstType || 'Inclusive',
                    stockQuantity: Number(row.stockQuantity),
                    unit: row.unit || 'Packet',
                    expiryDate: new Date(row.expiryDate), // format: YYYY-MM-DD
                    batchNo: row.batchNo,
                    minStockLevel: Number(row.minStockLevel) || 10,
                    supplier: row.supplier
                }));

                const inserted = await Product.insertMany(productsToInsert);

                // Cleanup file
                fs.unlinkSync(req.file.path);

                res.status(201).json({ message: 'Products imported successfully', count: inserted.length });
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
};

module.exports = { createProduct, getProducts, getExpiringProducts, updateProduct, deleteProduct, bulkImportProducts };
