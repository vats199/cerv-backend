const User = require('../models/user');
const Store = require('../models/store')
const Item = require('../models/item');
const Category = require('../models/category');
const fs = require('fs')
const path = require('path')

exports.postCategory = (req,res,next) => {
    const title = req.body.title;
    const image = req.file.path;
    Category.findOne({
        where: {
            title: title,
            userId: req.user.id
        }
    }).then(cat=>{
        if(!cat){
            Category.create({
                title: title,
                image: image,
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

exports.postItems = (req,res,next)=>{
    const title = req.body.title;
    const image = req.file.path;
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
                image: image,
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




const clearImage = filePath => {
    filePath = path.join(__dirname,'..',filePath);
    fs.unlink(filePath, err=> console.log(err))
  }