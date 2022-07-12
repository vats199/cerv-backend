const express = require('express');

const catererController = require('../controllers/catererController');
const cors = require('cors')
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth')
router.use(cors());

router.get('/getProfile', jwtAuth, catererController.getProfile)
router.get('/categories', jwtAuth, catererController.getCategories);
router.get('/category/:catId', jwtAuth, catererController.getCategory);
router.post('/add-category', jwtAuth, catererController.postCategory);
router.put('/edit-category/:catId', jwtAuth, catererController.editCategory);
router.delete('/delete-category/:catId', jwtAuth, catererController.deleteCategory);
router.post('/add-item', jwtAuth, catererController.postItems);
router.put('/edit-item/:itemId', jwtAuth, catererController.editItem);
router.delete('/delete-item/:itemId', jwtAuth, catererController.deleteItem)
router.post('/add-banner', jwtAuth, catererController.postBanner);
router.post('/addCoupon', jwtAuth, catererController.postCoupon);
router.get('/getCoupons', jwtAuth, catererController.getCoupons);
router.put('/editCoupon', jwtAuth, catererController.editCoupon);
router.delete('/deleteCoupon', jwtAuth, catererController.deleteCoupon);
router.get('/getOrders/:key', jwtAuth, catererController.getOrders);
router.post('/accept-order/:orderId', jwtAuth, catererController.acceptOrder);
router.post('/reject-order/:orderId', jwtAuth, catererController.rejectOrder);
router.put('/order-preparing', jwtAuth, catererController.orderPreparing);
router.put('/order-dispatched', jwtAuth, catererController.orderDispatched);
router.put('/order-delivered', jwtAuth, catererController.orderDelivered);
router.get('/get-invoice/:orderId', jwtAuth, catererController.getInvoice);

module.exports = router;