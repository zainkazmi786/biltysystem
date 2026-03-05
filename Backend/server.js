import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import rentPaymentRoutes from './routes/rentPaymentRoutes.js';
import staffRoutes from './routes/staffRoute.js'; 
import claimRoutes from './routes/claimRoutes.js';
import financialReportRoutes from './routes/financialReportRoutes.js';

// Load environment variables FIRST
dotenv.config();

// ES Modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/shipments', shipmentRoutes);
apiRouter.use('/vouchers', voucherRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/drivers', driverRoutes);
apiRouter.use('/vehicles', vehicleRoutes);
apiRouter.use('/trips', tripRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/shops', shopRoutes);
apiRouter.use('/rent-payments', rentPaymentRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/claims', claimRoutes);
apiRouter.use('/financial-reports', financialReportRoutes);

app.use('/api', apiRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date()
  });
});

// Welcome Route
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Cargo Lingo Dashboard</h1>
    <p>API is running. Use /api endpoints.</p>
    <p><a href="/health">Check health status</a></p>
  `);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Server Configuration
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

export default app;