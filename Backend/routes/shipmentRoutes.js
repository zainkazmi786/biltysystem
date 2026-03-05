import express from 'express';
import {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
  recalculateShipmentTotals,
  getAvailableBiltiesForVouchers
} from '../controllers/shipmentController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// All routes require authentication
router.use(requireSignIn);

// Create new shipment
router.post('/create', createShipment);

// Get all shipments
router.get('/get/all', getShipments);

// Get single shipment
router.get('/get/:id', getShipmentById);

// Update shipment
router.put('/update/:id', updateShipment);

// Delete shipment
router.delete('/delete/:id', deleteShipment);

// Recalculate totals for existing shipments
router.post('/recalculate-totals', recalculateShipmentTotals);

// Get available bilties for vouchers
router.get('/available-for-vouchers', getAvailableBiltiesForVouchers);

export default router; 