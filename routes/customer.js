const express = require('express');
const router = express.Router();
const cors = require('cors');
const jwtAuth = require('../middleware/jwtAuth')
const customerController = require('../controllers/customerController');
const stripeController = require('../controllers/stripe');


router.use(cors());

router.get('/caterers', customerController.getCaterers);
router.get('/caterer/:catId', customerController.getCaterer);
router.get('/profile',jwtAuth, customerController.getProfile);
router.put('/edit-profile',jwtAuth, customerController.editInfo);
router.post('/add-address',jwtAuth,customerController.postAddress);
router.put('/edit-address/:id',jwtAuth, customerController.editAddress);
router.post('/addCard', jwtAuth, stripeController.addCard);
router.get('/getCards', jwtAuth, stripeController.getCard);
router.post('/checkout_online',jwtAuth, stripeController.checkout_online);
// router.get('/search/:key', customerController.search)



module.exports = router;