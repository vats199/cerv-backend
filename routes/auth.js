const express = require("express");
const router = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
// const config = require('../util/config');
router.use(cors());
const authController = require("../controllers/authController");

function authUser(req, res, next) {
    let token = req.get('Authorization');
    token = token.split(' ')[1];

    jwt.verify(token, config.secret ,(err,user)=>{
        if(!err){
            console.log(user);
            req.user = user;
            next();
        } else{
            return res.status(403).json({message: "User not Authenticated"})
        }
    })
}

router.post('/refresh', (req,res)=>{
    const refreshToken = req.body.token;
    const refreshTokens = authController.refreshTokens;
    if(!refreshToken || !refreshTokens.includes(refreshToken)){
        return res.status(403).json({message: "User not Authenticated!"})
    }
    jwt.verify(refreshToken, "somesupersuperrefreshsecret", (err,user)=>{
        if(!err){
            const token = jwt.sign(
                {user: user.loadedUser},
                config.secret,
                { expiresIn: config.jwtExpiration }
              );
              return res.status(201).json({token});
        } else{
            return res.status(403).json({message: "User not Authenticated!"})
        }
    })
})

router.post('/protected', authUser , (req,res)=>{
    res.send("Inside Protected Route!")
})

router.post('/register', authController.postSignup);
router.post('/login', authController.postLogin);

router.post('/generateOTP/:id', authController.generateOTP);
router.post('/verifyOTP/:id', authController.verifyOTP);

// router.use(require('../util/check'))


module.exports = router;



























// const User = require("../models/user");
// const Account = require("../models/account");

// const router = express.Router();

// router.post("/signup-user", authController.signupUser);

// router.get("/verify/:token", authController.verifyAccount);

// router.post("/login", authController.login);

// router.post("/signup-caterer", authController.signupCaterer);