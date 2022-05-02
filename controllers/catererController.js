const User = require('../models/user');
const Store = require('../models/store')
const Item = require('../models/item');
const Category = require('../models/category');
const Banner = require('../models/banner');
const Coupon = require('../models/coupon');

const fs = require('fs')
const path = require('path')

const cloudinary = require('../util/image');
const { v4: uuidv4 } = require('uuid')

exports.postCategory = async (req,res,next) => {
    const title = req.body.title;
    const image = await cloudinary.uploader.upload(req.file.path, {
        public_id: uuidv4() + ' _profile',
        width: 500,
        height: 500,
        crop: 'fill',
      })
    Category.findOne({
        where: {
            title: title,
            userId: req.user.id
        }
    }).then(cat=>{
        if(!cat){
            Category.create({
                title: title,
                image: image.url,
                userId: req.user.id
            })
                      .then(category => {
                                return res.status(200).json({message: 'Category Stored!', data: category, status: 1})
                              })
                      .catch(err => {
                        return res.json({error: err, status: 0})
                                })
        }else {
            return res.json({ error: "CATEGORY ALREADY EXISTS", status: 0 })
          }
    }).catch(err => {
        return res.json({error: err, status: 0})
      })
    
}

exports.postItems = async(req,res,next)=>{
    const title = req.body.title;
    try {
        const image = await cloudinary.uploader.upload(req.file.path, {
            public_id: uuidv4() + ' _profile',
            width: 500,
            height: 500,
            crop: 'fill',
          })
        const categoryId = req.body.categoryId;
        const price = req.body.price;
        Category.findOne({
            where: {
                id: categoryId,
                userId: req.user.id
            }
        }).then(cat=>{
            if(!cat){
                return res.json({ error: `No Category exists for the given name!
                                   Enter Valid Category Name!`, status: 0 })
            }else{
                Item.create({
                    title: title,
                    image: image.url,
                    categoryName: cat.title,
                    price: price,
                    userId: req.user.id,
                    categoryId: cat.id
                }).then(item => {
                    return res.status(200).json({message: 'Item Stored!', data: item, status: 1})
                  })
                  .catch(err => {
                    return res.json({error: err, status: 0})
                    })
            }
        })
        
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
    }
}

exports.editItem = (req,res,next)=>{
    const itemId = req.params.itemId;
    const title = req.body.title;
    const image = req.file.path;
    const categoryId = req.body.categoryId;
    const price = req.body.price;

    Item.findOne({where: {id: itemId}})
        .then(item=>{
            if(item.userId === req.user.id){
                clearImage(item.image);
                item.title = title ;
                item.image = image;
                item.categoryId = categoryId;
                item.price = price;
                item.save();
                return res.status(200).json({message:"Updated item successfully!", data: item, status: 1})
            }else{
                return res.status(403).json({error: "User is not Authorized!", status: 0})
            }
         }).catch(err=>console.log(err))
}

exports.postBanner = (req,res,next)=>{
    const userId = req.user.id;
    const data = {
        image: req.file.path,
        userId: userId
    }
    Banner.create(data)
        .then(result=>{
            return res.status(200).json({message:"Banner created Successfully!", data: result, status: 1})
        })
        .catch(err=>console.log(err))

}

exports.postCoupon = async (req,res,next) => {
    const catererId = req.user.id;
    const data = req.body;

    const payLoad = {
        title: data.title,
        description: data.description,
        expiry: data.expiry,
        code: data.code,
        is_percent: data.is_percent,
        value: data.value,
        catererId: catererId
    }

    try{

        const coupon = await Coupon.create(payLoad);
        return res.status(200).json({message: "Coupon Created!", status: 1, data: coupon})

    }catch(err){
        console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
    }
}




const clearImage = filePath => {
    filePath = path.join(__dirname,'..',filePath);
    fs.unlink(filePath, err=> console.log(err))
  }