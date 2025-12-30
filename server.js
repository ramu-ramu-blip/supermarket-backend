import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // Required if serving images or if CORS needs specific headers
    contentSecurityPolicy: false      // Usually needed for APIs to avoid blocking valid requests
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Connect to Database
connectDB();

// Health Check / Root
app.get('/', (req, res) => {
    res.json({ 
        message: 'Supermarket POS API is running...', 
        status: 'healthy',
        version: '1.0.0'
    });
});

// For Vercel Health Route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Import Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ 
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5002;

// Export for Vercel
export default app;

// Listen only if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
