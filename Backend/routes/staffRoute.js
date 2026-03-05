// routes/staffRoutes.js
import express from 'express';
import {
  list,
  create,
  get,
  update,
  deleteStaff
} from '../controllers/staffController.js';
import upload from '../config/uploadConfig.js';

const router = express.Router();

// Match these endpoints with your frontend API calls
router.get('/', list);                 // GET /api/staff
router.post('/', upload.single('image'), create);       // POST /api/staff
router.get('/:id', get);               // GET /api/staff/:id
router.put('/:id', upload.single('image'), update);     // PUT /api/staff/:id
router.delete('/:id', deleteStaff);    // DELETE /api/staff/:id

export default router;