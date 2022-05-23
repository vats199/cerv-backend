const express = require("express");
const router = express.Router();
const cors = require('cors');
const jwtAuth = require('../middleware/jwtAuth')
const jwt = require('jsonwebtoken');
const config = require('../util/config');
router.use(cors());
const authController = require("../controllers/authController");


router.post('/refresh', authController.refresh)

router.post('/protected', jwtAuth , (req,res)=>{
    return res.send("Inside Protected Route!")
})

router.post('/register', authController.postSignup);
router.post('/login', authController.postLogin);

router.post('/generateOTP', authController.generateOTP);
router.post('/verifyOTP', authController.verifyOTP);
router.post('/forgotPassword',authController.forgotPassword);
router.post('/changePassword', jwtAuth, authController.changePassword)
router.post('/storeDetails', authController.postStore);
router.post('/logout',jwtAuth, authController.logout);
router.get('/noti', authController.sendNot);
// router.use(require('../util/check'))


module.exports = router;



























// const User = require("../models/user");
// const Account = require("../models/account");

// const router = express.Router();

// router.post("/signup-user", authController.signupUser);

// router.get("/verify/:token", authController.verifyAccount);

// router.post("/login", authController.login);

// router.post("/signup-caterer", authController.signupCaterer);