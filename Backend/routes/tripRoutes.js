import express from 'express';
import {
  getAllTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip
} from '../controllers/tripController.js';

const router = express.Router();

router.get('/', getAllTrips);
router.post('/', createTrip);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;