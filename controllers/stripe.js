const User = require('../models/user');
const Card = require('../models/card');
const Payment = require('../models/payment');

const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SK);

exports.addCard = async (req,res,next) => {
    try{

        const user = await User.findByPk(req.user_id);

        const exp = req.body.expire.split('/');
        const exp_month = exp[0];
        const exp_year = exp[1];

        const card = await stripe.customers.createSource(user.stripe_id, {
            source: {
                'object': 'card',
                'number': req.body.number,
                'exp_month': exp_month,
                'exp_year': exp_year,
                'cvc': req.body.cvc,
                'name': req.body.name
            }
        })
    const save = Card.create({ card_id: card.id, userId: req.user_id })
    return res.status(200).json({
        message: 'Card saved successfully!',
        card: save,
        status: 1
    });

    }catch(err){
        console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
    }
}

exports.getCard = async (req, res, next) => {
    try {

        const user = await User.findByPk(req.user_id);

        try {
            const cards = await stripe.customers.listSources(
                user.stripe_id,
                { object: 'card' }
            );
            return res.status(200).json({
                message: cards,
                status: 1
            });

        } catch (err) {
            console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
    }
}

exports.checkout_online = async (req, res, next) => {

    try {
        const user = await User.findByPk(req.user_id);
        const amount = req.body.amount;
        
        // Cheack whether user exists in stripe. 
        if (!user.stripe_id) {
            return res.status(500).json({ status: 0, message: 'Stripe account was not found!' });
        }


        const card = await stripe.customers.retrieveSource(
            user.stripe_id,
            req.body.card_id
        );

        const payment_intent = await stripe.paymentIntents.create({
            payment_method_types: ['card'],
            description: 'Pay for CERV',
            receipt_email: user.email,
            amount: parseFloat(amount)*100,
            currency: 'usd',
            customer : user.stripe_id,
            payment_method: card.id
        });

        return Payment.create({
            amount: parseFloat(amount),
            userId: req.user_id,
            transaction_id: payment_intent.client_secret,
            status: 'PENDING',
        })
            .then((data) => {
                return res.status(200).json({
                    message: 'Checkout data fetched successfully!',
                    data: {
                        client_secret: payment_intent.client_secret,
                        customerId: payment_intent.customer,
                        intent: payment_intent,
                        status: 1
                    }
                });
            })
            .catch((err) => {
                return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
            })
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
    }
}