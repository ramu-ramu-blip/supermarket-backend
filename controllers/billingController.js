import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

const createBill = async (req, res) => {
    const { items, customerName, customerPhone, totalAmount, gstAmount, discountAmount, netAmount, paymentMode } = req.body;

    try {
        const invoiceNumber = `INV-${Date.now()}`;
        const bill = await Bill.create({
            invoiceNumber,
            customerName,
            customerPhone,
            items,
            totalAmount,
            gstAmount,
            discountAmount,
            netAmount,
            paymentMode,
            user: req.user._id,
        });

        // Update Stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockQuantity: -item.quantity },
            });
        }

        res.status(201).json(bill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getInvoices = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = {
                $or: [
                    { invoiceNumber: { $regex: search, $options: 'i' } },
                    { customerName: { $regex: search, $options: 'i' } },
                    { customerPhone: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        const bills = await Bill.find(query).populate('user', 'name');
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id).populate('user', 'name');
        if (!bill) return res.status(404).json({ message: 'Invoice not found' });
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Invoice not found' });

        await Bill.deleteOne({ _id: req.params.id });
        res.json({ message: 'Invoice removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createBill, getInvoices, getInvoiceById, deleteBill };
