const User = require('../models/user');
const Store = require('../models/store')
const Item = require('../models/item');
const Address = require('../models/address')
const Category = require('../models/category');
const Feedback = require('../models/feedback');
const {Sequelize} = require('sequelize');
const { Op } = Sequelize.Op;
const Cart = require('../models/cart');
const CartItem = require('../models/cart-item');

const fs = require('fs')
const path = require('path');


exports.getCart = async (req,res,next) => {
    try{

        const user = await User.findByPk(req.user.id)
        const checkCart = await Cart.findOne({where: {userId: req.user.id}})
        if(checkCart){
            const items = await checkCart.getItems();
            return res.status(200).json({message: "Items present in the cart!", data: items})
        } else {
            const cart = await user.createCart();
            const items = await cart.getItems();
            return res.status(200).json({message: "Items present in the cart!", data: items})
        }
    }catch(err){
        console.log(err);
    }
}

exports.postCart = async (req,res,next)=>{
    const prodId = req.body.productId;
    try{
        const user = await User.findByPk(req.user.id)
        const checkCart = await Cart.findOne({where: {userId: req.user.id}})
        if(checkCart){
            const items = await checkCart.getItems({where: {id: prodId}})
        } else {
            const cart = await user.createCart();
        }
    }catch(err){
        console.log(err);
    }
}