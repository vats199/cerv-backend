const express = require('express');
const router = express.Router();
const cors = require('cors');
const jwtAuth = require('../middleware/jwtAuth')
const adminController = require('../controllers/adminController');


router.use(cors());

router.get('/users/:key' , jwtAuth, adminController.getUsers);
router.get('/search', jwtAuth, adminController.search);
router.post('/approve', jwtAuth, adminController.approve);
router.post('/reject', jwtAuth, adminController.reject);
router.get('/sort/:key/:term', jwtAuth, adminController.sort);


module.exports = router;