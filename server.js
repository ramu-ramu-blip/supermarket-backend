const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Models (Important for initialization)
require('./models/User');
require('./models/Product');
require('./models/Category');
require('./models/Bill');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Health Check
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
