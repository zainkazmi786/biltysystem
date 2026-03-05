import express from 'express';
import {
  getAllRentPayments,
  getRentPaymentsByShop,
  createRentPayment,
  getRentPaymentById,
  updateRentPayment,
  deleteRentPayment
} from '../controllers/rentPaymentController.js';

const router = express.Router();

// Rent payment routes
router.get('/', getAllRentPayments);
router.get('/shop/:shopId', getRentPaymentsByShop);
router.post('/', createRentPayment);
router.get('/:id', getRentPaymentById);
router.put('/:id', updateRentPayment);
router.delete('/:id', deleteRentPayment);

export default router; 