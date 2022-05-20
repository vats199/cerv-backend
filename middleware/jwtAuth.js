const jwt = require('jsonwebtoken');
const fs = require('fs');
const { isRegExp } = require('util/types');
const User  = require('../models/user');

const cert = fs.readFileSync('dev-3sdvkvha.pem')

module.exports = (req, res, next) => {
    let token = req.get('Authorization');

    if(!token){
        return res.status(403).json({error: "User not Authenticated", status: 0})
    }

    token = token.split(' ')[1];

    jwt.verify(token, cert ,async (err,user)=>{
        if(!err){
            // console.log(user);
            req.user_id = user.sub.split('|')[1];
            const loadedUser = await User.findByPk(user.sub.split('|')[1]);
            req.user = loadedUser;
            next();
        } else{
            return res.status(403).json({error: "User not Authenticated", status: 0})
        }
    })
}