const express = require("express");
const router = express.Router();
const cors = require('cors');
const jwtAuth = require('../middleware/jwtAuth')
const jwt = require('jsonwebtoken');
const config = require('../util/config');
router.use(cors());
const authController = require("../controllers/authController");
const { check, body } = require('express-validator/check');


router.post('/refresh', authController.refresh)

router.post('/protected', jwtAuth, (req, res) => {
    return res.send("Inside Protected Route!")
})

router.post('/register',
    body('email').isEmail()
        .withMessage('Please enter a valid email address!')

    ,
    body('password', 'Please Enter a valid Password!').isLength({ min: 5 })
        .trim()
    ,
    body('phone_number', 'Please Enter a mobile number!').isMobilePhone()
    , authController.postSignup);
router.post('/login',
    body('email').isEmail()
        .withMessage('Please enter a valid email address!')

    ,
    body('password', 'Please Enter a valid Password!').isLength({ min: 5 })
        .trim(), authController.postLogin);

router.post('/generateOTP', authController.generateOTP);
router.post('/verifyOTP', authController.verifyOTP);
router.post('/forgotPassword',
    body('email').isEmail()
        .withMessage('Please enter a valid email address!')
    , authController.forgotPassword);

router.post('/changePassword',
    body('currentPassword', 'Please Enter a valid Password!').isLength({ min: 5 })
        .trim(),
    body('newPassword', 'Please Enter a valid Password!').isLength({ min: 5 })
        .trim(), authController.changePassword)
router.post('/storeDetails', authController.postStore);
router.post('/logout', jwtAuth, authController.logout);
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