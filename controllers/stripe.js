// const User = require('../models/user');
// const Card = require('../models/card');
// const Payment = require('../models/payment');

// const Stripe = require('stripe');

// const stripe = Stripe(process.env.STRIPE_SK);

// exports.addCard = async (req,res,next) => {
//     try{

//         const user = await User.findByPk(req.user.id);

//         const card = await stripe.customers.createSource(user.stripe_id)

//     }catch(err){
//             if (!err.statusCode) {
//                 err.statusCode = 500;
//             }
//             next(err);
//     }
// }