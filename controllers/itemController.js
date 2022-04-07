const User = require('../models/user');
const Store = require('../models/store')
const Item = require('../models/item');
const Category = require('../models/category');

exports.postCategory = (req,res,next) => {
    const title = req.body.title;
    const image = req.body.image;
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
                      .then(user => {
                                res.json({message: 'Category Stored!'})
                              })
                      .catch(err => {
                                  res.send('ERROR: ' + err)
                                })
        }else {
            res.json({ error: "CATEGORY ALREADY EXISTS" })
          }
    }).catch(err => {
        res.send('ERROR: ' + err)
      })
    
}

exports.postItems = (req,res,next)=>{
    const title = req.body.title;
    const image = req.body.image;
    const categoryName = req.body.categoryName;
    const price = req.body.price;
    Category.findOne({
        where: {
            title: categoryName,
            userId: req.user.id
        }
    }).then(cat=>{
        if(!cat){
            res.json({ error: `No Category for the given name!
                               Enter Valid Category Name!` })
        }else{
            Item.create({
                title: title,
                image: image,
                categoryName: categoryName,
                price: price,
                userId: req.user.id,
                categoryId: cat.id
            }).then(user => {
                res.json({message: 'Item Stored!'})
              })
              .catch(err => {
                  res.send('ERROR: ' + err)
                })
        }
    })
}