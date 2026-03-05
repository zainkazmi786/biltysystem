import express from 'express';
import {
  getAllShops,
  createShop,
  getShopById,
  updateShop,
  deleteShop,
  getShopWithRentPayments
} from '../controllers/shopController.js';

const router = express.Router();

// Shop routes
router.get('/', getAllShops);
router.post('/', createShop);
router.get('/:id', getShopById);
router.put('/:id', updateShop);
router.delete('/:id', deleteShop);
router.get('/:id/rent-payments', getShopWithRentPayments);

export default router; 