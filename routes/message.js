const express = require('express');

const chatController = require('../controllers/chatController');
const cors = require('cors')
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth')
router.use(cors());

router.post('/', jwtAuth, chatController.sendMessage);
// router.post('/:chatId',jwtAuth, chatController.allMessages);

module.exports = router;