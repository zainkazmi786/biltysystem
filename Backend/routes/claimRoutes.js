import { Router } from 'express';
import {
  createClaim,
  getAllClaims,
  getClaimById,
  updateClaim,
  deleteClaim,
  downloadDocument,
  getStats
} from '../controllers/claimController.js';
import upload from '../config/uploadConfig.js';

const router = Router();

router.post('/', upload.single('document'), createClaim);
router.get('/', getAllClaims);
router.get('/:id', getClaimById);
router.put('/:id', upload.single('document'), updateClaim);
router.delete('/:id', deleteClaim);
router.get('/:id/download', downloadDocument);
router.get('/stats', getStats);

export default router;