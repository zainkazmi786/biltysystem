import express from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  searchCustomerByBilty,
  addBiltyToCustomer,
  updateBiltyPaymentStatus,
  removeBiltyFromCustomer
} from '../controllers/customerController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// Create new customer
router.post('/create', createCustomer);

// Get all customers with filtering and pagination
router.get('/get/all', getCustomers);

// Get customer statistics
router.get('/stats', getCustomerStats);

// Search customer by bilty number
router.get('/search/bilty/:biltyNumber', searchCustomerByBilty);

// Get single customer by ID
router.get('/get/:id', getCustomerById);

// Update customer
router.put('/update/:id', updateCustomer);

// Delete customer
router.delete('/delete/:id', deleteCustomer);

// Add bilty to customer
router.post('/:customerId/bilties', addBiltyToCustomer);

// Update bilty payment status
router.put('/:customerId/bilties/:biltyNumber/payment-status', updateBiltyPaymentStatus);

// Remove bilty from customer
router.delete('/:customerId/bilties/:biltyNumber', removeBiltyFromCustomer);

export default router;