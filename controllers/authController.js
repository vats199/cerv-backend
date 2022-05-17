const bcrypt = require('bcryptjs');
const config = require('../util/config');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid')
const nodemailer = require('nodemailer');
const mailjet = require('node-mailjet').connect(process.env.mjapi, process.env.mjsecret);
const jwt = require('jsonwebtoken');
const client = require('twilio')(process.env.accounSID, process.env.authToken);
const { Op } = require('@sequelize/core')
const fs = require('fs');
const cloudinary = require('../util/image');
const stripe = require('stripe')(process.env.STRIPE_SK);
const request = require('request');

let refreshTokens = {};

const User = require('../models/user');
const Store = require('../models/store');
const Token = require('../models/token');

exports.postSignup = async (req, res, next) => {
  // console.log(JSON.stringify(req));
  // console.log()
  if (req.body === {}) {
    return console.log("Your Body is empty!")
  }
  try {
    // console.log(req.file.path)
    const result = await cloudinary.uploader.upload(req.file.path, {
      public_id: uuidv4() + ' _profile',
      width: 500,
      height: 500,
      crop: 'fill',
    })

    const test = await User.findOne({ where: { email: req.body.email } })

    if (!test) {
      const options = {
        method: 'POST',
        url: 'https://dev-3sdvkvha.us.auth0.com/dbconnections/signup',
        headers: { 'content-type': 'application/json' },
        form: {
          client_id: process.env.CLIENT_ID,
          connection: process.env.CONNECTION,
          email: req.body.email,
          password: req.body.password,
          name: req.body.name
        }
      }

      request(options, async(error,response, body)=>{
        if (error) {
          console.log(error);
          return res.json(500).json({
            ErrorMessage: 'Some Auth0 error while making singup request!',
            status: 0
          })
        }

        // Check whether any logical error is occurd or not.
        let json_body = JSON.parse(body);
        if (json_body.statusCode === 400) {
          return next(json_body);
        }
        const customer = await stripe.customers.create({
              name: req.body.name,
              email: req.body.email,
              phone: req.body.country_code + req.body.phone_number,
              description: 'Cerv Customer!',
            });
            const user = await User.findByPk(json_body.user_id);
            user.stripe_id = customer.id;
            user.role = req.body.role;
            user.image = result.url;
            user.country_code = req.body.country_code;
            user.phone_number = req.body.phone_number;
            user.is_verify = 1;
            await user.save();
            return res.status(200).json({ message: 'Registeration Successfull!', userData: user, status: 1 })
      })
    } else {
      return res.json({ error: "USER ALREADY EXISTS", status: 0 })
    }
  } catch (err) {
    console.log(err);
  }

}

exports.postLogin = async (req, res, next) => {

  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
        role: req.body.role
      }
    })

    if (!user) {
      return res.status(400).json({ error: 'User does not exist with the role or email selected!', status: 0 })
    }
    if (user.role == 0) {
      const store = await Store.findOne({ where: { userId: user.id } })

      if (store.is_approved == 0) {
        return res.status(400).json({ message: "Caterer is not verified by the admin!", status: 0 });
      } else if (store.is_approved == 2) {
        return res.status(400).json({ message: "Caterer is declined by the admin!", status: 0 });
      }

    }
    var options = {
      method: 'POST',
      url: 'https://dev-3sdvkvha.us.auth0.com/oauth/token',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {
        grant_type: 'password',
        username: req.body.email,
        password: req.body.password,
        audience: process.env.AUDIENCE,
        scope: 'offline_access',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      }
    };

    // Make login request to third party Auth0 api.

    request(options, async (error, response, body) => {
      if (error) {
        console.log(error);
        return res.json(500).json({
          ErrorMessage: 'Some Auth0 error while making login request!',
          status: 0
        })
      }

      // Check whether any logical error is occurd or not.
      let json_body = JSON.parse(body);
      if (json_body.error) {
        return next(json_body);
      }
          let loadedUser = user;

        loadedUser.is_active = 1;
        await loadedUser.save();
      try {

        const getToken = await Token.findOne({ where: { userId: loadedUser.id } })
        if (getToken) {
          getToken.login_count += 1;
          getToken.token = json_body.access_token;
          getToken.refreshToken = json_body.refresh_token;
          getToken.status = 'active';
          getToken.expiry = json_body.expires_in;
  
          await getToken.save();
  
          return res.status(200).json({
            message: 'Logged-in Successfully',
            user: loadedUser,
            token: json_body.access_token,
            refreshToken: json_body.refresh,
            status: 1
          })
        } else {
          const data = {
            userId: loadedUser.id,
            token: json_body.access_token,
            refreshToken: json_body.refresh_token,
            status: 'active',
            login_count: 1,
            expiry: json_body.expires_in
          }
          await Token.create(data)
          return res.status(200).json({
            message: 'Logged-in Successfully',
            user: loadedUser,
            token: json_body.access_token,
            refreshToken: json_body.refresh_token, status: 1
          })
        }
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }

    })

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}


exports.logout = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    const getToken = await Token.findOne({ where: { userId: userId } })

    if (getToken) {
      if (getToken.token == null) {
        return res.json({ error: "User already Logged-out!", status: 0 })
      } else {

        getToken.token = null;
        getToken.status = 'expired';
        getToken.expiry = null;
        user.is_active = 0;
        await getToken.save();
        await user.save();
        return res.status(200).json({ message: 'Logged-out Successfully', status: 1 })
      }
    } else {
      return res.json({ error: "Log-out Failed!", status: 0 })
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.refreshTokens;

exports.generateOTP = async (req, res, next) => {
  const country_code = req.body.country_code
  const number = req.body.phone_number;
  try {
    const otp = await client
      .verify
      .services(process.env.serviceID)
      .verifications
      .create({
        to: `${country_code}${number}`,
        channel: req.body.channel
      })
    return res.status(200).json({ message: "OTP sent Successfuly", status: 1 });
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.verifyOTP = async (req, res, next) => {
  const country_code = req.body.country_code
  const number = req.body.phone_number;

  try {
    const otp = await client
      .verify
      .services(process.env.serviceID)
      .verificationChecks
      .create({
        to: `${country_code}${number}`,
        code: req.body.otpValue
      })
    if (otp.valid == true) {

      return res.status(200).json({ message: "Mobile Number verified!", status: 1 });
    } else {
      return res.status(400).json({ error: "Invalid OTP entered!", status: 0 })
    }
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.refresh = async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken || !(refreshToken in refreshTokens)) {
    return res.status(403).json({ error: "Invalid RefreshToken!", status: 0 })
  }
  var options = {
    method: 'POST',
    url: 'https://dev-3sdvkvha.us.auth0.com/oauth/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form:
    {
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: refreshToken
    }
  };
  try {
    request(options, async (error, response, body) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ ErrorMessage: 'Some Auth0 error while making refresh_token request!', status: 0 });
      }

      // Check whether any logical error is occurd or not.
      let json_body = JSON.parse(body);
      if (json_body.error_description) { return next(json_body); }

      await Token.update({ token: json_body.access_token }, { where: { refreshToken: refreshToken } })

      // Send success response.
      return res.status(200).json({
        message: "Get access token successfully.",
        access_token: json_body.access_token,
        expires_in: json_body.expires_in,
        token_type: json_body.token_type,
        status: 1
      });

    });

  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ ErrorMessage: 'Getting refresh token failed!', status: 0 });
  }
}


exports.resetPasswordLink = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.status(200).json({
        error: err, status: 0
      });
    }
    const token = buffer.toString('hex');
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(user => {
      if (!user) {
        return res.send({ error: "No account found for this email!", status: 0 })
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
      .then(result => {
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
          .post("send", { 'version': 'v3.1' })
          .request({
            "Messages": [
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
        request.then(result => {
          return res.status(200).json({
            message: 'Password reset link send to your email', status: 1
          })
        }).catch(err => console.log(err))

      }).catch(err => console.log(err))
  })
}

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: { [Op.gt]: Date.now() }
    }
  })
    .then(user => {
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        userId: user.id,
        passwordToken: token
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let resetUser;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords does not match!" })
  }

  User.findOne({
    where: {
      resetToken: token,
      resetTokenExpiration: { [Op.gt]: Date.now() },
      id: userId
    }
  }).then(user => {
    if (!user) {
      return res.status(400).json({ message: 'Reset token Invalid!' });
    }
    resetUser = user;
    return bcrypt.hash(newPassword, 10);
  }).then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = null;
    resetUser.resetTokenExpiration = null;
    return resetUser.save();
  }).then(result => {
    return res.json({ message: "Password Changed Successfully!!", status: 1 })
  }).catch(err => console.log(err))
}

exports.changePassword = (req, res, body) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  User.findOne({
    where: {
      id: req.user.id
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not Found!', status: 0 });
      }
      resetUser = user;
      return bcrypt.compare(currentPassword, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        return res.status(403).json({ error: 'Invalid Current password!', status: 0 });
      }
      return bcrypt.hash(newPassword, 10);
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
        }, status: 1
      })
    })
    .catch(err => {
      console.log(err);
    })
}

exports.postStore = (req, res, next) => {

  const userId = req.params.id;

  User.findOne({
    where: {
      id: userId
    }
  }).then(user => {
    if (user.role == 0) {
      const storeData = {
        license_num: req.body.license_num,
        license_image: req.body.license_image,
        address: req.body.address,
        bio: req.body.bio,
        order_type: req.body.order_type,
        userId: userId,
        name: user.name,
        category: req.body.category
      }
      Store.findOne({
        where: {
          license_num: req.body.license_num
        }
      })
        .then(store => {
          if (!store) {
            Store.create(storeData)
              .then(storeData => {
                return res.status(200).json({ message: 'Store Registered', data: storeData, status: 1 })
              })
              .catch(err => {
                return res.json({ error: err, status: 0 })
              })
          } else {
            return res.json({ error: "STORE ALREADY EXISTS", status: 0 })
          }
        })
        .catch(err => {
          return res.json({ error: err, status: 0 })
        })
    } else {
      return res.json({ error: "USER IS NOT A CATERER!", status: 0 })
    }
  }).catch(err => {
    return res.json({ error: err, status: 0 })
  })

}







// const clearImage = filePath => {
//   filePath = path.join(__dirname, '..', filePath);
//   fs.unlink(filePath, err => console.log(err))
// }