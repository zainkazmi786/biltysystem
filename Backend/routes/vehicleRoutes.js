import express from 'express';
import {
  getAllVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/', getAllVehicles);
router.post('/', createVehicle);
router.get('/:id', getVehicleById);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;