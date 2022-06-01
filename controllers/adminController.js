const User = require('../models/user');
const Store = require('../models/store')
const Item = require('../models/item');
const Address = require('../models/address');
const Banner = require('../models/banner');
const Category = require('../models/category');
const Feedback = require('../models/feedback');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Favourites = require('../models/favourites');
const Coupon = require('../models/coupon');
const fs = require('fs')
const path = require('path')
const db = require('../util/database');

const cloudinary = require('../util/image');
const { v4: uuidv4 } = require('uuid');

exports.getUsers = async (req,res,next) => {
    const key = req.params.key;
    const adminId = req.user_id;
    try{

      const admin = await User.findByPk(adminId);

      if(admin.role == 3){

              if(key == 1){

                  const users = await User.findAll({where: { role: 1 }, attributes: {exclude: ['password']}})

                  return res.status(200).json({message: "Users Fetched Successfully!", customers: users, totalCustomers: users.length, status: 1})

              }else if(key == 2){

                  const totalCaterers = await Store.count()
                  const caterers = await Store.findAll({ include: {
                                                        model: User,
                                                        as: 'caterer',
                                                        foreignKey: 'catererId',
                                                        attributes: { exclude: ['password'] },
                                                        include: {
                                                          model: Category,
                                                          include: {
                                                            model: Item
                                                          }
                                                        }
                                                      } });
          
                  if(totalCaterers !== 0){
                    for(let i=0; i<caterers.length;i++){
                      // const rating = await Feedback.findOne({ where: { catererId: caterers[i].userId } ,attributes: [Sequelize.fn('AVG', Sequelize.col('rating'))], raw: true });
                      const rating = await db.sequelize.query(`SELECT AVG(rating) as rating FROM feedbacks WHERE catererId = ${caterers[i].catererId}`)
                      const avgPri = await db.sequelize.query(`SELECT AVG(price) as avgPrice FROM items WHERE categoryId IN ( SELECT id FROM categories WHERE userId = ${caterers[i].catererId})`)
                      const avgPrice = Math.floor(avgPri[0][0].avgPrice);
                      const decimal = (rating[0][0].rating)%1;
                      let rate;
                      if(decimal < 0.25){
                        rate = Math.floor(rating[0][0].rating)
                      } else if(decimal <= 0.75){
                        rate = Math.floor(rating[0][0].rating) + 0.5;
                      }else {
                        rate = Math.floor(rating[0][0].rating) + 1;
                      }
                      caterers[i].dataValues.rating = rate;
                      caterers[i].dataValues.averagePrice = avgPrice;
                    }
                  }
                          return res.status(200).json({message: 'Fetched Caterers Successfully!', 
                                                        store: caterers,
                                                        totalCaterers: totalCaterers, status: 1})
              }
      }else {
        return res.status(400).send({message: "You are not authorized to do this!", status: 0});
      }
        } catch(err) {
            console.log(err);
            return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
        }

}

exports.search = async (req,res,next) => {
    const term = req.query.term;
    const adminId = req.user_id;

    try {
      const admin = await User.findByPk(adminId);

      if(admin.role == 3){

        const customers = await User.findAll({ where: {name: { [Op.like]: '%'+ term + '%' }}});
        const caterers = await Store.findAll({
          where: {name: { [Op.like]: '%'+ term + '%' }}, include: {
            model: User,
            as: 'caterer',
            foreignKey: 'catererId',
            attributes: { exclude: ['password'] },
            include: {
              model: Category,
              include: {
                model: Item
              }
            }
          }
        });
        return res.status(200).json({message: "Results for search", 
                                     totalResults: caterers.length + customers.length , 
                                     customers: customers, 
                                     stores: caterers, 
                                     totalCustomers: customers.length, 
                                     totalCaterers: caterers.length, 
                                     status: 1});
        }else {
          return res.status(400).send({message: "You are not authorized to do this!", status: 0});
        } 
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
    }
}

exports.approve = async (req,res,next) => {
    const storeId = req.body.storeId;
    const adminId = req.user_id;

    try {
      const admin = await User.findByPk(adminId);

      if(admin.role == 3){

        const store = await Store.findByPk(storeId);

        store.is_approved = 1;

        await store.save()

        return res.status(200).json({message: "Caterer Approved!", status: 1})
    }else {
      return res.status(400).send({message: "You are not authorized to do this!", status: 0});
    }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
    }
}

exports.reject = async (req,res,next) => {
    const storeId = req.body.storeId;
    const adminId = req.user_id;

    try {
      const admin = await User.findByPk(adminId);

      if(admin.role == 3){

        const store = await Store.findByPk(storeId);

        store.is_approved = 2;

        await store.save()

        return res.status(200).json({message: "Caterer Rejected!", status: 1})

      }else {
        return res.status(400).send({message: "You are not authorized to do this!", status: 0});
      }  
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
    }
}

exports.sort = async (req,res,next) => {
    const key = req.params.key;
    const term = req.params.term;
    const adminId = req.user_id;

    try {
      const admin = await User.findByPk(adminId);

      if(admin.role == 3){

        if(key == 1){

            if(term == 'recent'){

                const users = await User.findAll()

                return res.status(200).json({message: "Users Fetched Successfully!", 
                                             customers: users.sort((a,b) => (a.dataValues.createdAt < b.dataValues.createdAt) ? 1 : ((b.dataValues.createdAt < a.dataValues.createdAt) ? -1 : 0)), 
                                             totalCustomers: users.length, 
                                             status: 1})
            } else if(term == 'name'){

                const users = await User.findAll()

                return res.status(200).json({message: "Users Fetched Successfully!", 
                                             customers: users.sort((a,b) => (a.dataValues.name.toLowerCase() < b.dataValues.name.toLowerCase()) ? 1 : ((b.dataValues.name.toLowerCase() < a.dataValues.name.toLowerCase()) ? -1 : 0)), 
                                             totalCustomers: users.length, 
                                             status: 1})
            }

        }else if(key == 2){

            if(term == 'recent'){

                const totalCaterers = await Store.count()
                const caterers = await Store.findAll({ include: {
                                                  model: User,
                                                  include: {
                                                    model: Category,
                                                    include: {
                                                      model: Item
                                                    }
                                                  }
                                                } });
    
            if(totalCaterers !== 0){
              for(let i=0; i<caterers.length;i++){
                // const rating = await Feedback.findOne({ where: { catererId: caterers[i].userId } ,attributes: [Sequelize.fn('AVG', Sequelize.col('rating'))], raw: true });
                const rating = await db.sequelize.query(`SELECT AVG(rating) as rating FROM feedbacks WHERE catererId = ${caterers[i].userId}`)
                const avgPri = await db.sequelize.query(`SELECT AVG(price) as avgPrice FROM items WHERE categoryId IN ( SELECT id FROM categories WHERE userId = ${caterers[i].userId})`)
                const avgPrice = Math.floor(avgPri[0][0].avgPrice);
                const decimal = (rating[0][0].rating)%1;
                let rate;
                if(decimal < 0.25){
                  rate = Math.floor(rating[0][0].rating)
                } else if(decimal <= 0.75){
                  rate = Math.floor(rating[0][0].rating) + 0.5;
                }else {
                  rate = Math.floor(rating[0][0].rating) + 1;
                }
                caterers[i].dataValues.rating = rate;
                caterers[i].dataValues.averagePrice = avgPrice;
              }
            }
                    return res.status(200).json({message: 'Fetched Caterers Successfully!', 
                                                  caterer: caterers.sort((a,b) => (a.dataValues.createdAt < b.dataValues.createdAt) ? 1 : ((b.dataValues.createdAt < a.dataValues.createdAt) ? -1 : 0)),
                                                  totalCaterers: totalCaterers, status: 1})
            } else if(tern == 'name') {

                const totalCaterers = await Store.count()
                const caterers = await Store.findAll({ include: {
                                                  model: User,
                                                  include: {
                                                    model: Category,
                                                    include: {
                                                      model: Item
                                                    }
                                                  }
                                                } });
    
            if(totalCaterers !== 0){
              for(let i=0; i<caterers.length;i++){
                // const rating = await Feedback.findOne({ where: { catererId: caterers[i].userId } ,attributes: [Sequelize.fn('AVG', Sequelize.col('rating'))], raw: true });
                const rating = await db.sequelize.query(`SELECT AVG(rating) as rating FROM feedbacks WHERE catererId = ${caterers[i].userId}`)
                const avgPri = await db.sequelize.query(`SELECT AVG(price) as avgPrice FROM items WHERE categoryId IN ( SELECT id FROM categories WHERE userId = ${caterers[i].userId})`)
                const avgPrice = Math.floor(avgPri[0][0].avgPrice);
                const decimal = (rating[0][0].rating)%1;
                let rate;
                if(decimal < 0.25){
                  rate = Math.floor(rating[0][0].rating)
                } else if(decimal <= 0.75){
                  rate = Math.floor(rating[0][0].rating) + 0.5;
                }else {
                  rate = Math.floor(rating[0][0].rating) + 1;
                }
                caterers[i].dataValues.rating = rate;
                caterers[i].dataValues.averagePrice = avgPrice;
              }
            }
                    return res.status(200).json({message: 'Fetched Caterers Successfully!', 
                                                  caterer: caterers.sort((a,b) => (a.dataValues.name.toLowerCase() < b.dataValues.name.toLowerCase()) ? 1 : ((b.dataValues.name.toLowerCase() < a.dataValues.name.toLowerCase()) ? -1 : 0)),
                                                  totalCaterers: totalCaterers, status: 1})
            }

        }
    }else {
        return res.status(400).send({message: "You are not authorized to do this!", status: 0});
      }     
    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
    }
}