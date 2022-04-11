const bcrypt = require('bcryptjs');
const config = require('../util/config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mailjet = require('node-mailjet').connect(process.env.mjapi, process.env.mjsecret);
const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.accounSID, process.env.authToken);
const {Op} = require('@sequelize/core')

let refreshTokens = {};

const ranToken = require('rand-token');


const User = require('../models/user');
const Store = require('../models/store')

// const transporter = nodemailer.createTransport({
//   host: 'smtp.ethereal.email',
//   port: 587,
//   auth: {
//       user: 'mike.vandervort97@ethereal.email',
//       pass: '1E8w4hvPuzskRe99sE'
//   }
// });

exports.postSignup = (req, res, next) => {
  const userData = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    role: req.body.role,
    image: req.file.path
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
              res.status(200).json({ message:'Registeration Successfull!' , userData: user})
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
        process.env.secret,
        { expiresIn: process.env.jwtExpiration }
      );
      const refreshToken = jwt.sign(
        {loadedUser},
        "somesupersuperrefreshsecret",
        { expiresIn: process.env.jwtRefreshExpiration }
      );
      // refreshTokens.push(refreshToken); 
      // const response = { message: 'Logged-in Successfully', user: loadedUser , token: token, refreshToken: refreshToken }
      refreshTokens[refreshToken] = {token: token, refreshToken: refreshToken};
      return res.status(200).json({message: 'Logged-in Successfully', user: loadedUser , token: token, refreshToken: refreshToken})
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
    User.findByPk(userId)
    .then(user=>{
      if(user.is_verify == 0){
        const country_code = req.body.countryCode
        const number = req.body.number;
    User.update({ phone_number: number, country_code: country_code},
      {where: {
        id: userId
      }}
    ).then(result=>{
    client
        .verify
        .services(process.env.serviceID)
        .verifications
        .create({
          to: `${country_code}${number}`,
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
      } else {
        res.json({message: "User is already verified!"})
      }
    }).catch(err=> console.log(err));
    
      
  
  }

  exports.refresh = (req,res,next)=>{
    const refreshToken = req.body.token;
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
  }
  
  exports.verifyOTP = (req,res,next) => {
    const userId = req.params.id
    User.findOne({
      where: {
        id: userId
      }
    }).then(user=> {
      const country_code = user.country_code
      const number = user.phone_number;
      client
      .verify
      .services(process.env.serviceID)
      .verificationChecks
      .create({
        to: `${country_code}${number}`,
        code: req.body.code 
      })
      .then(async data => {
        if(data.valid == true){
          user.is_verify = 1;
          const result = await user.save();
          res.status(200).send({ message: "Mobile number Verified", data: data });
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

  exports.resetPasswordLink = (req,res,next)=>{
    crypto.randomBytes(32,(err,buffer)=>{
      if(err){
        return res.status(200).json({
          message: err
      });
      }
      const token = buffer.toString('hex');
      User.findOne({
        where: {
          email: req.body.email
        }
      }).then(user=>{
        if(!user){
          res.send({message: "No account found for this email!"})
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result=>{
        // transporter.sendMail({
        //   to: req.body.email,
        //   from: 'vatsalp.tcs@gmail.com',
        //         subject: 'Password Reset Form!',
        //         html: `
        //             <p>You requested to reset your password for our website</p>
        //             <p>Click on this <a href="http://localhost:3000/reset/${token}">link</a> to reset a new password
        //         `
        // })

        const request = mailjet
                              .post("send", {'version': 'v3.1'})
                              .request({
                                "Messages":[
                                  {
                                    "From": {
                                      "Email": "vatsalp.tcs@gmail.com",
                                      "Name": "Vatsal"
                                    },
                                    "To": [
                                      {
                                        "Email": req.body.email
                                      }
                                    ],
                                    "Subject": "Greetings from CERV.",
                                    "HTMLPart": `
                                                <p>You requested to reset your password for our website</p>
                                                <p>Click on this <a href="https://cerv-api.herokuapp.com/users/resetPassword/${token}">link</a> to reset a new password
                                              `,
                                    "CustomID": "AppGettingStartedTest"
                                  }
                                ]
                              })
                            request.then(result=>{
                              return res.status(200).json({
                                message: 'Password reset link send to your email'
                            })
                            }).catch(err=>console.log(err))
        
      }).catch(err=>console.log(err))
    })
  }

  exports.resetPassword = async (req,res,next)=> {
    const newPassword = req.body.newPassword;
    // const userId = req.body.userId;
    const token = req.params.token;
    let resetUser;

    User.findOne({
      where: {
          resetToken: token,
          resetTokenExpiration: { [Op.gt]: Date.now() }
      }
  }).then(user=>{
      resetUser = user;
      return bcrypt.hash(newPassword, 10);
    }).then(hashedPassword=>{
      resetUser.password = hashedPassword;
            resetUser.resetToken = null;
            resetUser.resetTokenExpiration = null;
            return resetUser.save();
    }).then(result=>{
      return res.send({message: "Password Changed Successfully!!"})
    }).catch(err=>console.log(err))
  }


  exports.changePassword = (req, res, body) => {
    const email = req.body.email,
        currentPassword = req.body.currentPassword,
        newPassword = req.body.newPassword;

    User.findOne({
        where: {
            email: email
        }
    })
        .then(user => {
            if (!user) {
                return res.status(404).json({ errorMessage: 'User not Found!' });
            }
            resetUser = user;
            return bcrypt.compare(currentPassword, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                return res.status(403).json({ errorMessage: 'Invalid password' });
            }
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            return resetUser.save();
        })
        .then(result => {
            return res.status(200).json({
                message: 'Password changed successfully..',
                data: {
                    id: resetUser.id,
                    name: resetUser.name,
                    email: resetUser.email
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.json({
                errorMessage: 'Some thing gose wrong!'
            });
        })
}


exports.postStore = (req,res,next)=>{

  const userId = req.params.id;

  User.findOne({
    where: {
      id: userId 
    }
  }).then(user=>{
    if(user.role==0){
            const storeData = {
              license_num: req.body.license_num,
              license_image: req.body.license_image,
              address: req.body.address,
              bio: req.body.bio,
              order_type: req.body.order_type,
              userId: userId,
              name: user.name
          }
          Store.findOne({
              where: {
                  license_num: req.body.license_num
              }
          })
          .then(store=>{
              if(!store){
                  Store.create(storeData)
                      .then(storeData => {
                                res.status(200).json({message: 'Store Registered', data: storeData})
                              })
                      .catch(err => {
                                  res.send('ERROR: ' + err)
                                })
              } else {
                  res.json({ error: "STORE ALREADY EXISTS" })
                }
          })
          .catch(err => {
              res.send('ERROR: ' + err)
            })
    }else {
      res.json({ error: "USER IS NOT A CATERER!" })
    }
  }).catch(err => {
    res.send('ERROR: ' + err)
  })

}







const clearImage = filePath => {
  filePath = path.join(__dirname,'..',filePath);
  fs.unlink(filePath, err=> console.log(err))
}