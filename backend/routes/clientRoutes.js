const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', authMiddleware, clientController.getClients);
router.post('/', authMiddleware, upload.array('documents', 5), clientController.addClient);
router.put('/:id', authMiddleware, upload.array('documents', 5), clientController.updateClient);
router.delete('/:id', authMiddleware, clientController.deleteClient);

module.exports = router;
