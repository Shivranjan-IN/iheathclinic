const express = require('express');
const medicineController = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', medicineController.getAllMedicines);
router.get('/:id', medicineController.getMedicineById);

module.exports = router;
