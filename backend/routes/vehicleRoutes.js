const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', vehicleController.getVehicles);
router.post('/', authMiddleware, upload.single('image'), vehicleController.addVehicle);
router.put('/:id', authMiddleware, upload.single('image'), vehicleController.updateVehicle);
router.delete('/:id', authMiddleware, vehicleController.deleteVehicle);

module.exports = router;
