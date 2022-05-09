const express = require('express');

const chatController = require('../controllers/chatController');
const cors = require('cors')
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth')
router.use(cors());

router.post('/getChat',jwtAuth, chatController.getChat);
router.get('/getChats',jwtAuth, chatController.getChats);

module.exports = router;