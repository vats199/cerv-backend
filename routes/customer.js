const express = require('express');
const router = express.Router();
const cors = require('cors');
const jwtAuth = require('../middleware/jwtAuth')
const customerController = require('../controllers/customerController');


router.use(cors());

router.get('/caterers', customerController.getCaterers);
router.get('/caterer/:catId', customerController.getCaterer);


module.exports = router;