const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', authMiddleware, contractController.getContracts);
router.get('/latest-terms', authMiddleware, contractController.getLatestTerms);
router.post('/template', authMiddleware, upload.single('template'), contractController.uploadTemplate);
router.get('/template-info', authMiddleware, contractController.getTemplateInfo);
router.post('/generate', authMiddleware, contractController.generateContract);

module.exports = router;
