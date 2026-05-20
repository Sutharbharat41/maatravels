const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/analytics', authMiddleware, reportController.getAnalytics);
router.get('/export/excel', authMiddleware, reportController.exportExcel);
router.get('/export/pdf', authMiddleware, reportController.exportPdf);

module.exports = router;
