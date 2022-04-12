const User = require('../models/user');
const Store = require('../models/store')
const Item = require('../models/item');
const Address = require('../models/address')
const Category = require('../models/category');
const Feedback = require('../models/feedback');

const fs = require('fs')
const path = require('path');

exports.getCaterers = async (req,res,next) => {

    try{
        const totalCaterers = await Store.count()
        const caterers = await Store.findAll()
        // const details = await Store.findAll( {where: { userId: caterers._id }})
                res.status(200).json({message: 'Fetched Caterers Successfully!', 
                                   caterer: caterers,
                                   totalCaterers: totalCaterers})
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
      res.status(200).json({ message: 'Caterer fetched', data: caterer })
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
      return res.status(200).json({message: "Found Profile!", data: profileData})
    }

  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
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
     return res.status(200).json({message:"Profile Updated!", data: result});
    }

  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.postAddress = async (req,res,next)=>{
  const title = req.body.title;
  const address = req.body.address;
  const userId = req.user.id;
  try{

    const add = await Address.create({
      title: title,
      address: address,
      userId: userId
    })
    return res.status(200).json({message:"Address Added!", data: add});

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

  const title = req.body.title;
  const add = req.body.address;
  try{
    const address = await Address.findOne({where:{id: addressId, userId: userId}})
  
    if(address){
      address.title = title;
      address.address = add;
      const result = await address.save();
      return res.status(200).json({message:"Address Updated!", data: result});
    } else {
      return res.status(404).json({message: "No address found for the given id!"})
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
    return res.status(200).json({message: "Feedback Submitted!", data: rev})
  }
  catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}





const clearImage = filePath => {
  filePath = path.join(__dirname,'..',filePath);
  fs.unlink(filePath, err=> console.log(err))
}