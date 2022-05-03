const express = require('express');

const catererController = require('../controllers/catererController');
const cors = require('cors')
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth')
router.use(cors());

router.post('/add-category',jwtAuth, catererController.postCategory);
router.post('/add-item', jwtAuth,catererController.postItems);
router.post('/edit-item/:itemId', jwtAuth,catererController.editItem);
router.post('/add-banner',jwtAuth, catererController.postBanner);

module.exports = router;