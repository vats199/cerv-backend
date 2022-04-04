const express = require('express');

const itemController = require('../controllers/itemController');

const router = express.Router();

router.get('/get-items', itemController.getItems);

module.exports = router;