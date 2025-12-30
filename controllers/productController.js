import Product from '../models/Product.js';
import Category from '../models/Category.js';

const createProduct = async (req, res) => {
    try {
        if (req.body.category) {
            const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${req.body.category}$`, 'i') } });
            if (!categoryExists) {
                await Category.create({ name: req.body.category });
            }
        }
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { barcode: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        const products = await Product.find(query);
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
        if (req.body.category) {
            const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${req.body.category}$`, 'i') } });
            if (!categoryExists) {
                await Category.create({ name: req.body.category });
            }
        }
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

import fs from 'fs';
import csv from 'csv-parser';

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
                // Map CSV data to schema
                const productsToInsert = results.map(row => ({
                    ...row,
                    costPrice: Number(row.costPrice),
                    sellingPrice: Number(row.sellingPrice),
                    gstPercent: Number(row.gstPercent) || 0,
                    stockQuantity: Number(row.stockQuantity),
                    minStockLevel: Number(row.minStockLevel) || 10,
                    expiryDate: new Date(row.expiryDate)
                }));

                // Extract and unique categories from CSV
                const categories = [...new Set(results.map(r => r.category).filter(Boolean))];
                for (const cat of categories) {
                    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${cat}$`, 'i') } });
                    if (!exists) await Category.create({ name: cat });
                }

                const inserted = await Product.insertMany(productsToInsert);
                fs.unlinkSync(req.file.path);
                res.status(201).json({ message: 'Products imported successfully', count: inserted.length });
            } catch (error) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                res.status(400).json({ message: error.message });
            }
        });
};

export { createProduct, getProducts, getExpiringProducts, updateProduct, deleteProduct, bulkImportProducts };
