const express = require('express');

const catererController = require('../controllers/catererController');
const cors = require('cors')
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth')
router.use(cors());

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
router.post('/getCoupons', jwtAuth, catererController.getCoupons);
router.get('/getOrders/:key', jwtAuth, catererController.getOrders);
router.post('/accept-order/:orderId', jwtAuth, catererController.acceptOrder);
router.post('/reject-order/:orderId', jwtAuth, catererController.rejectOrder);

module.exports = router;