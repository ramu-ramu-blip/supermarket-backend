import Purchase from '../models/Purchase.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const getPurchases = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            // Find suppliers matching the search term to filter by supplier name
            const Supplier = (await import('../models/Supplier.js')).default;
            const matchingSuppliers = await Supplier.find({
                name: { $regex: search, $options: 'i' }
            });
            const supplierIds = matchingSuppliers.map(s => s._id);

            query = {
                $or: [
                    { invoiceNumber: { $regex: search, $options: 'i' } },
                    { supplier: { $in: supplierIds } }
                ]
            };
        }

        const purchases = await Purchase.find(query)
            .populate('supplier')
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPurchase = async (req, res) => {
    try {
        const { items, status, discount, supplier } = req.body;
        
        let processedItems = [];
        let totalAmount = 0;

        for (const item of items) {
            let productId = item.product;

            // If it's a new product (no id, but has name/category)
            if (item.isNew && item.name) {
                // Check and create category if doesn't exist
                if (item.category) {
                    const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${item.category}$`, 'i') } });
                    if (!categoryExists) {
                        await Category.create({ name: item.category });
                    }
                }

                const newProduct = await Product.create({
                    name: item.name,
                    brand: item.brand || '',
                    category: item.category || 'Uncategorized',
                    costPrice: Number(item.costPrice),
                    sellingPrice: Number(item.sellingPrice) || Number(item.costPrice) * 1.2,
                    stockQuantity: 0, // Will be updated by the purchase logic below
                    expiryDate: item.expiryDate || new Date(Date.now() + 365*24*60*60*1000), // Default 1 year if not provided
                    unit: item.unit || 'Packet',
                    supplier: supplier,
                    barcode: item.barcode || ''
                });
                productId = newProduct._id;
            }

            const total = Number(item.quantity) * Number(item.costPrice);
            totalAmount += total;

            processedItems.push({
                product: productId,
                quantity: Number(item.quantity),
                costPrice: Number(item.costPrice),
                sellingPrice: Number(item.sellingPrice),
                total: total
            });

            // Update product stock if purchase is completed
            if (status === 'Completed') {
                const product = await Product.findById(productId);
                if (product) {
                    product.stockQuantity += Number(item.quantity);
                    product.costPrice = Number(item.costPrice);
                    if (item.sellingPrice) {
                        product.sellingPrice = Number(item.sellingPrice);
                    }
                    product.supplier = supplier;
                    await product.save();
                }
            }
        }

        const finalTotal = totalAmount - (Number(discount) || 0);

        const purchase = await Purchase.create({
            ...req.body,
            items: processedItems,
            totalAmount: finalTotal
        });

        res.status(201).json(purchase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);
        // Optional: Revert stock changes if needed, but keeping it simple for now (manual adjustment might be safer)
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.json({ message: 'Purchase deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getPurchases, createPurchase, deletePurchase };
