const bcrypt = require('bcryptjs');
const config = require('../util/config');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const client = require('twilio')(config.accounSID, config.authToken);
let refreshTokens = [];

const ranToken = require('rand-token');


const User = require('../models/user');

exports.postSignup = (req, res, next) => {
  const userData = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    role: req.body.role,
    image: req.body.image
  }
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          userData.password = hash
          User.create(userData)
            .then(user => {
              res.json({ status: user.email + ' REGISTERED' })
            })
            .catch(err => {
              res.send('ERROR: ' + err)
            })
        })
      } else {
        res.json({ error: "USER ALREADY EXISTS" })
      }
    })
    .catch(err => {
      res.send('ERROR: ' + err)
    })
}

exports.postLogin = (req, res, next) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        res.status(400).json({ error: 'User does not exist!' })
      }
      loadedUser = user;
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(isEqual => {
      if (!isEqual) {
        res.status(400).json({ error: 'Invalid Password!' })
      }
      const token = jwt.sign(
        {loadedUser},
        config.secret,
        { expiresIn: config.jwtExpiration }
      );
      const refreshToken = jwt.sign(
        {loadedUser},
        "somesupersuperrefreshsecret",
        { expiresIn: config.jwtRefreshExpiration }
      );
      refreshTokens.push(refreshToken); 
      // const response = { message: 'Logged-in Successfully', user: loadedUser , token: token, refreshToken: refreshToken }
      // refreshTokens[refreshToken] = response;
      return res.status(200).json({message: 'Logged-in Successfully', User: loadedUser , token: token, refreshToken: refreshToken})
        // res.status(200).json(response);
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    })
  }

  exports.refreshTokens ;

  exports.generateOTP = (req,res,next) => {
    const userId = req.params.id;
  
    const number = req.body.number;
    User.update({ pNumber: number},
      {where: {
        id: userId
      }}
    ).then(result=>{
    client
        .verify
        .services(config.serviceID)
        .verifications
        .create({
          to: `${number}`,
          channel: req.body.channel 
        })
        .then(data => {
          res.status(200).send({message: "OTP sent Successfuly", data: data});
        })
        .catch(err=>{
          console.log(err)
        })
    })
    .catch(err=>console.log(err))
      
  
  }
  
  exports.verifyOTP = (req,res,next) => {
    const userId = req.params.id
    User.findOne({
      where: {
        id: userId
      }
    }).then(user=> {
      number = user.pNumber;
      client
      .verify
      .services(config.serviceID)
      .verificationChecks
      .create({
        to: `${number}`,
        code: req.body.code 
      })
      .then(data => {
        if(data.valid == true){
          User.update({ is_verify: 1},
            {where: {
              id: userId
            }}
          ).then(result=>{

            res.status(200).send({message: "Mobile number Verified", data: data});
          })
        } else{
          res.status(400).send({message: "Invalid OTP entered!"})
        }
      })
      .catch(err=>{
        console.log(err)
      })
    })
    .catch(err=>console.log(err))
    
  }