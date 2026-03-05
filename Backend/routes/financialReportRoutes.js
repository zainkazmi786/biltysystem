import express from 'express';
import {
  getAllFinancialReports,
  createFinancialReport,
  getFinancialReportById,
  updateFinancialReport,
  deleteFinancialReport,
  checkTodayReport,
  getTodaysTrips,
  getAllStaff,
  getMonthlyReport,
  getYearlyReport,
  generateDailyPDF,
  generateMonthlyPDF,
  generateYearlyPDF
} from '../controllers/financialReportController.js';

const router = express.Router();

// Basic CRUD routes
router.get('/', getAllFinancialReports);
router.post('/', createFinancialReport);
router.get('/:id', getFinancialReportById);
router.put('/:id', updateFinancialReport);
router.delete('/:id', deleteFinancialReport);

// Helper routes
router.get('/check/today', checkTodayReport);
router.get('/trips/today', getTodaysTrips);
router.get('/staff/all', getAllStaff);

// Report summary routes
router.get('/monthly/:year/:month', getMonthlyReport);
router.get('/yearly/:year', getYearlyReport);

// PDF generation routes
router.get('/pdf/daily/:id', generateDailyPDF);
router.get('/pdf/monthly/:year/:month', generateMonthlyPDF);
router.get('/pdf/yearly/:year', generateYearlyPDF);

export default router;