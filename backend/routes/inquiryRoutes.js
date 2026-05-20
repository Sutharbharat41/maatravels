const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', inquiryController.submitInquiry);
router.get('/', authMiddleware, inquiryController.getInquiries);
router.post('/:id/reply', authMiddleware, inquiryController.replyInquiry);
router.put('/:id/resolve', authMiddleware, inquiryController.toggleResolve);

module.exports = router;
