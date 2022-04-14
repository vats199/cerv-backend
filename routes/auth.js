const express = require("express");
const router = express.Router();
const cors = require('cors');
const jwtAuth = require('../middleware/jwtAuth')
const jwt = require('jsonwebtoken');
const config = require('../util/config');
router.use(cors());
const authController = require("../controllers/authController");
const multer = require('multer');


const fileStorage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
  });
  
  const fileFilter = (req,file,cb) => {
    if( file.mimetype == 'image/png' || 
        file.mimetype == 'image/jpeg' || 
        file.mimetype == 'image/jpg') {
            cb(null, true);
        } else {
            cb(null, false);
        }
  }
 const uploads = (multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));


router.post('/refresh', authController.refresh)

router.post('/protected', jwtAuth , (req,res)=>{
    return res.send("Inside Protected Route!")
})

router.post('/register', uploads , authController.postSignup);
router.post('/login', authController.postLogin);

router.post('/generateOTP', authController.generateOTP);
router.post('/verifyOTP', authController.verifyOTP);
router.post('/reset',authController.resetPasswordLink);
router.post('/resetPassword/:token',authController.resetPassword);
router.post('/storeDetails/:id', authController.postStore);
router.post('/logout',jwtAuth, authController.logout)
// router.use(require('../util/check'))


module.exports = router;



























// const User = require("../models/user");
// const Account = require("../models/account");

// const router = express.Router();

// router.post("/signup-user", authController.signupUser);

// router.get("/verify/:token", authController.verifyAccount);

// router.post("/login", authController.login);

// router.post("/signup-caterer", authController.signupCaterer);