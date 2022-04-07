const jwt = require('jsonwebtoken');
const config = require('../util/config')
module.exports = (req, res, next) => {
    let token = req.get('Authorization');
    token = token.split(' ')[1];

    jwt.verify(token, process.envsecret ,(err,user)=>{
        if(!err){
            // console.log(user.loadedUser.id);
            req.user = user.loadedUser;
            next();
        } else{
            return res.status(403).json({message: "User not Authenticated"})
        }
    })
}