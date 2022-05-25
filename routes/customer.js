const express = require('express');
const router = express.Router();
const cors = require('cors');
const jwtAuth = require('../middleware/jwtAuth')
const customerController = require('../controllers/customerController');
const stripeController = require('../controllers/stripe');


router.use(cors());

router.get('/caterers', jwtAuth, customerController.getCaterers);
router.get('/caterers/:filter', jwtAuth, customerController.filterCaterers);
router.get('/catererInfo/:catererId', jwtAuth, customerController.getCaterer);
router.get('/get-banners', jwtAuth, customerController.getBanner)
router.get('/profile',jwtAuth, customerController.getProfile);
router.get('/picture', jwtAuth, customerController.getDP);
router.put('/edit-profile',jwtAuth, customerController.editInfo);
router.get('/get-address', jwtAuth, customerController.getAddress);
router.post('/add-address',jwtAuth,customerController.postAddress);
router.put('/edit-address',jwtAuth, customerController.editAddress);
router.delete('/delete-address', jwtAuth, customerController.deleteAddress);
router.post('/activate-address', jwtAuth, customerController.activateAddress);
router.post('/post-review',jwtAuth, customerController.postReview);
router.post('/addCard', jwtAuth, stripeController.addCard);
router.get('/getCards', jwtAuth, stripeController.getCard);
router.post('/checkout_online',jwtAuth, stripeController.checkout_online);
router.get('/fee', jwtAuth, customerController.getDeliveryFee);
router.post('/postOrder', jwtAuth,customerController.postOrder);
router.post('/cancelOrder', jwtAuth,customerController.cancelOrder);
router.get('/getOrders/:key', jwtAuth, customerController.getOrders);
router.post('/applyToken', customerController.applyToken);
// router.put('/order-status', jwtAuth, customerController.putOrderStatus);
router.post('/add-to-favourites', jwtAuth, customerController.postFav);
router.get('/get-favourites', jwtAuth, customerController.getFav);
router.delete('/delete-favourites', jwtAuth, customerController.deleteFav);
router.get('/search/:key', customerController.search)



module.exports = router;