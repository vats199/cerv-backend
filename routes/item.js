const express = require('express');

const itemController = require('../controllers/itemController');
const cors = require('cors')
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth')
router.use(cors());

router.post('/add-category',jwtAuth, itemController.postCategory);
router.post('/add-item', jwtAuth,itemController.postItems);
router.post('/edit-item/:itemId', jwtAuth,itemController.editItem);
router.post('/add-banner',jwtAuth, itemController.postBanner)

module.exports = router;