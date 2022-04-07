const express = require("express");
const router = express.Router();
const cors = require('cors');
const jwtAuth = require('../middleware/jwtAuth')
const jwt = require('jsonwebtoken');
const config = require('../util/config');
router.use(cors());
const authController = require("../controllers/authController");

router.post('/refresh', (req,res)=>{
    const refreshToken = req.body.token;
    const refreshTokens = authController.refreshTokens;
    if(!refreshToken || !(refreshToken in refreshTokens)){
        return res.status(403).json({message: "User not Authenticated!"})
    }
    jwt.verify(refreshToken, "somesupersuperrefreshsecret", (err,user)=>{
        if(!err){
            const token = jwt.sign(
                {user: user.loadedUser},
                process.env.secret,
                { expiresIn: process.env.jwtExpiration }
              );
              return res.status(201).json({token});
        } else{
            return res.status(403).json({message: "User not Authenticated!"})
        }
    })
})

router.post('/protected', jwtAuth , (req,res)=>{
    res.send("Inside Protected Route!")
})

router.post('/register', authController.postSignup);
router.post('/login', authController.postLogin);

router.post('/generateOTP/:id', authController.generateOTP);
router.post('/verifyOTP/:id', authController.verifyOTP);
router.post('/reset',authController.resetPasswordLink);
router.post('/resetPassword/:token',authController.resetPassword);
router.post('/storeDetails/:id', authController.postStore);
// router.use(require('../util/check'))


module.exports = router;



























// const User = require("../models/user");
// const Account = require("../models/account");

// const router = express.Router();

// router.post("/signup-user", authController.signupUser);

// router.get("/verify/:token", authController.verifyAccount);

// router.post("/login", authController.login);

// router.post("/signup-caterer", authController.signupCaterer);