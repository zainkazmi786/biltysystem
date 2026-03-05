import express from 'express';
import {
  getAllDrivers,
  createDriver,
  getDriverById,
  updateDriver,
  deleteDriver
} from '../controllers/driverController.js';

const router = express.Router();

router.get('/', getAllDrivers);
router.post('/', createDriver);
router.get('/:id', getDriverById);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;