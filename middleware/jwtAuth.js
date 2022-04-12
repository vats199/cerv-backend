const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    let token = req.get('Authorization');
    token = token.split(' ')[1];

    jwt.verify(token, process.env.secret ,(err,user)=>{
        if(!err){
            // console.log(user);
            req.user = user.loadedUser;
            req.token = user.token;
            next();
        } else{
            return res.status(403).json({message: "User not Authenticated"})
        }
    })
}