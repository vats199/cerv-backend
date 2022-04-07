const express = require('express');

const itemController = require('../controllers/itemController');
const cors = require('cors')
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth')
router.use(cors());

router.post('/add-category',jwtAuth, itemController.postCategory);
router.post('/add-item', jwtAuth,itemController.postItems);

module.exports = router;