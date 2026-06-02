const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', bookmarkController.getBookmarks);
router.post('/', bookmarkController.toggleBookmark);

module.exports = router;
