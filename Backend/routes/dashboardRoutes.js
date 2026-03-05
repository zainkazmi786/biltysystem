import express from 'express';
import { 
  getDashboardStats, 
  getRecentShipments, 
  getMonthlyRevenue, 
  getTopCustomers, 
  getPaymentStats 
} from '../controllers/dashboardController.js';
import { authenticateToken } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Recent shipments
router.get('/recent-shipments', getRecentShipments);

// Monthly revenue data
router.get('/monthly-revenue', getMonthlyRevenue);

// Top customers
router.get('/top-customers', getTopCustomers);

// Payment statistics
router.get('/payment-stats', getPaymentStats);

export default router; 