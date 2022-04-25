const User = require('../models/user');
const Store = require('../models/store')
const Item = require('../models/item');
const Address = require('../models/address')
const Category = require('../models/category');
const Feedback = require('../models/feedback');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Favourites = require('../models/favourites');
const Coupon = require('../models/coupon');

const Sequelize = require('sequelize');
const { Op } = Sequelize.Op;

const fs = require('fs')
const path = require('path');

exports.getCaterers = async (req,res,next) => {

    try{
        const totalCaterers = await Store.count()
        const caterers = await Store.findAll()
        // const details = await Store.findAll( {where: { userId: caterers._id }})
                return res.status(200).json({message: 'Fetched Caterers Successfully!', 
                                              caterer: caterers,
                                              totalCaterers: totalCaterers, status: 1})
        } catch(err) {
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
        }

}

exports.getCaterer = async (req,res,next)=>{
    const catId = req.params.catId;
  try { 
  const caterer = await Store.findOne({where:{ id: catId }})
  
      if (!caterer) {
        const error = new Error("Couldn't Find the Caterer");
        error.statusCode = 404;
        throw error;
      }
//   const items = await 
     return res.status(200).json({ message: 'Caterer fetched', data: caterer, status: 1 })
} catch(err) {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}
}
exports.getProfile = async (req,res,next)=>{
  try{
    const user = await User.findOne({where: {id: req.user.id}});
    if(!user){
        const error = new Error("Couldn't Find the Profile!");
        error.statusCode = 404;
        throw error;
    }
    else {
      const profileData = {
        name: user.name,
        image: user.image,
        email: user.email,
        countryCode: user.country_code,
        phoneNumber: user.phone_number
      }
      return res.status(200).json({message: "Found Profile!", data: profileData, status: 1})
    }

  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}

exports.getDP = async (req,res,next) => {
  const userId = req.user.id;

  try{

    const dp = await User.findOne({where: { id: userId }})

    return res.status(200).json({message: "Profile Picture fetched Successfully!", dp: dp.image, status: 1})

  }catch(err){
    console.log(err);
        return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.editInfo = async (req,res,next)=>{
  const name = req.body.name;
  const image = req.file.path;
  const email = req.body.email;
  try{
    const user = await User.findOne({where: {id: req.user.id}});
    if(!user){
        const error = new Error("Couldn't Find the Profile!");
        error.statusCode = 404;
        throw error;
    }
    else {
     if(image != user.image){
       clearImage(user.image)
     }
    //  console.log(name)
     user.name = name;
     user.image = image
     user.email = email;
     const result = await user.save();
     return res.status(200).json({message:"Profile Updated!", data: result, status: 1});
    }

  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.postAddress = async (req,res,next)=>{
  const payload = {
    primary_address: req.body.primary_address,
    addition_address_info: req.body.addition_address_info,
    address_type: req.body.address_type || 0,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    userId: req.user.id
}
  try{

    const address = await Address.create(payload)
    return res.status(200).json({message:"Address Added!", data: address, status: 1});

  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.editAddress = async (req,res,next)=>{
  const userId = req.user.id;
  const addressId = req.params.id;

  try{
    const address = await Address.findOne({where:{id: addressId, userId: userId}})
  
    if(address){
      address.primary_address = req.body.primary_address || address.primary_address;
      address.addition_address_info = req.body.addition_address_info || address.addition_address_info;
      address.address_type = req.body.address_type || address.address_type;
      address.latitude = req.body.latitude || address.latitude;
      address.longitude = req.body.longitude || address.longitude;
      try {
          const result = await address.save();
          return res.status(200).json({message:"Address Updated!", data: result, status: 1});
      } catch (err) {
          console.log(err)
          return res.status(404).json({error:"Address Not Updated!", status: 0});
      }
    } else {
      return res.status(404).json({error: "No address found for the given id!", status: 0})
    }
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.postReview = async (req,res,next) => {
  const userId = req.user.id;
  const catererId = req.body.catId;
  try{
    const rev = await Feedback.create({
      rating: req.body.rating,
      review: req.body.review,
      userId: userId,
      catererId: catererId
    })
    return res.status(200).json({message: "Feedback Submitted!", data: rev, status: 1})
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.search = async (req,res,next)=>{
  const { term } = req.query;
  const key = req.params.key; 
  // key->1   categories
  // key->2   items
  // key->3   caterers
try{
  if(key === 1){
    const totalResults = await Category.count({where: {title: { [Op.like]: '%'+ term + '%' }}})
    const results = await Category.findAll({where: {title: { [Op.like]: '%'+ term + '%' }}});

    return res.status(200).json({message: 'Fetched Categories Successfully!', 
                                              results: results,
                                              totalCaterers: totalResults, status: 1})
  }


  if(key === 2){
    const totalResults = await Item.count({where: {title: { [Op.like]: '%'+ term + '%' }}})
    const results = await Item.findAll({where: {title: { [Op.like]: '%'+ term + '%' }}});

    return res.status(200).json({message: 'Fetched Items Successfully!', 
                                              results: results,
                                              totalItems: totalResults, status: 1})
  }


  if(key === 3){
    const totalResults = await Store.count({where: {name: { [Op.like]: '%'+ term + '%' }}})
    const results = await Store.findAll({where: {name: { [Op.like]: '%'+ term + '%' }}});

    return res.status(200).json({message: 'Fetched Caterers Successfully!', 
                                              results: results,
                                              totalCaterers: totalResults, status: 1})
  }
} catch(err){
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}

}

exports.getDeliveryFee = (req,res,next) => {
  const lat1 = req.body.lat;
  const lon1 = req.body.lng;
  let deliveryFee;
  Store.findOne({where: {
    userId: req.body.userId
  }})
    .then((store) => {
        const lat2 = store.lat;
        const lon2 = store.lng;

        const R = 6371; // kms
        const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in km
        if (d < 5){
          deliveryFee = 2.5
        } else if(d < 10) {
          deliveryFee = 5
        }

        return deliveryFee;
    })
    .then((results) => {
      res.status(200).json({
        deliveryFee: results
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });

}

// exports.getDeliveryFee = (req,res,next) => {
//   const lat1 = req.body.lat;
//   const lon1 = req.body.lng;
//   let deliveryFee;
  
    
//   const lat2 = req.body.lat2;
//   const lon2 = req.body.lng2;

//   const R = 6371; // kms
//   const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//   const a =
//     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   const d = R * c; // in km
//   if (d < 5){
//     deliveryFee = 2.5
//   } else if(5 <= d < 10) {
//     deliveryFee = 5
//   }

//   return res.json({fee: deliveryFee});
    

// }

exports.postOrder = async (req,res,next) => {
  const userId = req.user.id,
        catererId = req.body.catererId,
        items = req.body.items,
        order_type = req.body.orderType,
        amount = req.body.totalAmount;
  try{
    const order = await Order.create({ order_type: order_type ,
                                      catererId: catererId,
                                      userId: userId,
                                      amount: amount})
    let arr  = [],
        keys = Object.keys(items);
      
    for(let i=0,n=keys.length;i<n;i++){
            let key  = keys[i];
            arr[key] = items[key];
        }
    for(let j=0 ; j<arr.length ; j++){
          if(arr[j]){
    const orderItems = await OrderItem.create({ itemId: arr[j].id,
                                                orderId: order.id,
                                                quantity: arr[j].qty,
                                                itemTotal: (arr[j].qty) * (arr[j].price)});
            
      }
    }
    return res.status(200).json({message: "Order has been Placed!", order: order, status: 1});
  } catch(err){
    console.log(err);
        return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }      
  
}

exports.putOrderStatus = async (req,res,next) => {
  const catererId = req.user.id;
  const status = req.body.status;
  const orderId = req.body.orderId;

try{

  const order = await Order.findOne({ where: { catererId: catererId, id: orderId } })
  
  order.status = status;
  const result = await order.save();
  return res.status(200).json({message: "Order Status Updated!", result: result, status: 1})

} catch(err){
  console.log(err);
        return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
}
}

exports.postFav = async (req,res,next) => {
  const userId = req.user.id;
  const catererId = req.body.catererId;

  try{
    const fav = await Favourites.create({ userId: userId, catererId: catererId })
    return res.status(200).json({message: "Added to Favourites!", result: fav, status: 1})
  }catch(err){
    console.log(err);
        return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.getFav = async (req,res,next) => {
  const userId = req.user.id;

  try{

    const favs = await Favourites.findAll({ where: { userId: userId } });
    if(favs.length === 0){
      return res.status(400).json({message: "No Favourites Found!", status: 1})
    }
    let caterers = [];
    for(let i=0; i<favs.length;i++){
      const cat = await User.findByPk(favs[i].catererId);
      caterers.push(cat);
    }
    return res.status(200).json({message: "Favourites Caterers Found!", result: caterers, status: 1})

  } catch(err){
    console.log(err);
        return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.deleteFav = async (req,res,next) => {
  const userId = req.user.id;
  const catererId = req.body.id;
  try{

    await Favourites.destroy({ where: { catererId: catererId, userId: userId } })
    return res.status(200).json({ message: "Removed from favourites!", status:1 })
  }catch(err){
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.applyToken = async (req,res,next) => {
  const price = req.body.price;
  const couponCode = req.body.couponCode;
  let updatedPrice;

  try{

    const coupon = await Coupon.findOne({ where: { code: couponCode } });
     if(!coupon){
       return res.status(400).json({message: "Coupon Code is invalid!", status: 0})
     } else {
            if(coupon.is_percent === 1){

              updatedPrice = price - ( price * ((coupon.value)/100) );

            } else {
                    if(price < coupon.value){
                      updatedPrice = 0;
                    }else{
                      updatedPrice = price - coupon.value;
                    }

            }
            return res.status(200).json({message: "Price updated!", updatedPrice: updatedPrice})
     }

  }catch(err){
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }

}

const clearImage = filePath => {
  filePath = path.join(__dirname,'..',filePath);
  fs.unlink(filePath, err=> console.log(err))
}