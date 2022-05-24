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
const Token = require('../models/token')
const Notification = require('../models/notifications');
const notifications = require('../util/notifications');

const cloudinary = require('../util/image');
const { v4: uuidv4 } = require('uuid')

const { Op } = require('sequelize');

const db = require('../util/database');

const fs = require('fs')
const path = require('path');
const { time } = require('console');
const { TokenInstance } = require('twilio/lib/rest/api/v2010/account/token');

exports.getCaterers = async (req, res, next) => {
  try {
    const totalCaterers = await Store.count()
    const caterers = await Store.findAll({
      where: { is_approved: 1 }, include: {
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
    // const details = await Store.findAll( {where: { userId: caterers._id }})

    if (totalCaterers !== 0) {
      for (let i = 0; i < caterers.length; i++) {
        // const rating = await Feedback.findOne({ where: { catererId: caterers[i].userId } ,attributes: [Sequelize.fn('AVG', Sequelize.col('rating'))], raw: true });
        const rating = await db.sequelize.query(`SELECT AVG(rating) as rating FROM feedbacks WHERE catererId = ${caterers[i].catererId}`)
        const avgPri = await db.sequelize.query(`SELECT AVG(price) as avgPrice FROM items WHERE categoryId IN ( SELECT id FROM categories WHERE userId = ${caterers[i].catererId})`)
        const fav = await Favourites.findOne({ where: { userId: req.user_id, catererId: caterers[i].catererId } });
        let is_fav;
        if(fav) {
          is_fav = 1;
        } else{
          is_fav = 0;
        }
        const avgPrice = Math.floor(avgPri[0][0].avgPrice);
        const decimal = (rating[0][0].rating) % 1;
        let rate;
        if (decimal < 0.25) {
          rate = Math.floor(rating[0][0].rating)
        } else if (decimal <= 0.75) {
          rate = Math.floor(rating[0][0].rating) + 0.5;
        } else {
          rate = Math.floor(rating[0][0].rating) + 1;
        }
        caterers[i].dataValues.rating = rate;
        caterers[i].dataValues.averagePrice = avgPrice;
        caterers[i].dataValues.is_favourite = is_fav;
      }
    }
    return res.status(200).json({
      message: 'Fetched Caterers Successfully!',
      caterer: caterers,
      totalCaterers: totalCaterers, status: 1
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }

}

exports.filterCaterers = async (req, res, next) => {
  const filter = req.params.filter;

  try {
    const totalCaterers = await Store.count()
    const caterers = await Store.findAll({ include: [User, Category, Item] });
    // const details = await Store.findAll( {where: { userId: caterers._id }})

    if (totalCaterers !== 0) {
      for (let i = 0; i < caterers.length; i++) {
        // const rating = await Feedback.findOne({ where: { catererId: caterers[i].userId } ,attributes: [Sequelize.fn('AVG', Sequelize.col('rating'))], raw: true });
        const rating = await db.sequelize.query(`SELECT AVG(rating) as rating FROM feedbacks WHERE catererId = ${caterers[i].userId}`)
        const avgPri = await db.sequelize.query(`SELECT AVG(price) as avgPrice FROM items WHERE storeId = ${caterers[i].id}`)
        const avgPrice = Math.floor(avgPri[0][0].avgPrice);
        const decimal = (rating[0][0].rating) % 1;
        let rate;
        if (decimal < 0.25) {
          rate = Math.floor(rating[0][0].rating)
        } else if (decimal <= 0.75) {
          rate = Math.floor(rating[0][0].rating) + 0.5;
        } else {
          rate = Math.floor(rating[0][0].rating) + 1;
        }
        caterers[i].dataValues.rating = rate;
        caterers[i].dataValues.averagePrice = avgPrice;
      }
    }
    if (filter === 'rating') {
      return res.status(200).json({
        message: 'Fetched Caterers Successfully!',
        caterer: caterers.sort((a, b) => (a.dataValues.rating < b.dataValues.rating) ? 1 : ((b.dataValues.rating < a.dataValues.rating) ? -1 : 0)),
        totalCaterers: totalCaterers, status: 1
      })
    }
    if (filter === 'descPrice') {
      return res.status(200).json({
        message: 'Fetched Caterers Successfully!',
        caterer: caterers.sort((a, b) => (a.dataValues.averagePrice < b.dataValues.averagePrice) ? 1 : ((b.dataValues.averagePrice < a.dataValues.averagePrice) ? -1 : 0)),
        totalCaterers: totalCaterers, status: 1
      })
    }
    if (filter === 'ascPrice') {
      return res.status(200).json({
        message: 'Fetched Caterers Successfully!',
        caterer: caterers.sort((a, b) => (a.dataValues.averagePrice > b.dataValues.averagePrice) ? 1 : ((b.dataValues.averagePrice > a.dataValues.averagePrice) ? -1 : 0)),
        totalCaterers: totalCaterers, status: 1
      })
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getCaterer = async (req, res, next) => {
  // console.log(req.body);
  const catId = req.body.catererId;
  try {
    const caterer = await Store.findOne({ include: User, attributes: { exclude: ['password'] } , where: { userId: catId } })
    const category = await Category.findAll({ include: Item, where: { userId: catId } })

    if (!caterer) {
      const error = new Error("Couldn't Find the Caterer");
      error.statusCode = 404;
      throw error;
    }
    //   const items = await 
    return res.status(200).json({ message: 'Caterer fetched', data: caterer, category: category, status: 1 })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getBanner = async (req, res, next) => {
  try {

    const banners = await Banner.findAll();
    return res.status(200).json({ message: "Banners fetched successfully!", banners: banners, length: banners.length, status: 1 })

  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user_id } });
    if (!user) {
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
      return res.status(200).json({ message: "Found Profile!", data: profileData, status: 1 })
    }

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}

exports.getDP = async (req, res, next) => {
  const userId = req.user_id;

  try {

    const dp = await User.findOne({ where: { id: userId } })

    return res.status(200).json({ message: "Profile Picture fetched Successfully!", dp: dp.image, status: 1 })

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.editInfo = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const image = req.file?.path;
  let url;
  if (image) {

    const result = await cloudinary.uploader.upload(image, {
      public_id: uuidv4() + ' _profile',
      width: 500,
      height: 500,
      crop: 'fill',
    })
    url = result.url
  } else {
    url = null;
  }


  // let image;
  // if(req.file){

  //   image = req.file.path;
  // } else {
  //   image = null
  // }


  try {
    const user = await User.findOne({ where: { id: req.user_id } });
    if (!user) {
      const error = new Error("Couldn't Find the Profile!");
      error.statusCode = 404;
      throw error;
    }
    else {
      if (image != user.image) {
        clearImage(user.image)
      }
      //  console.log(name)
      user.name = name || user.name;
      user.image = url || user.image
      user.email = email || user.email;
      const result = await user.save();
      return res.status(200).json({ message: "Profile Updated!", data: result, status: 1 });
    }

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.postAddress = async (req, res, next) => {
  const payload = {
    address: req.body.address,
    icon: req.body.icon,
    address_type: req.body.address_type || 0,
    // latitude: req.body.latitude,
    // longitude: req.body.longitude,
    userId: req.user_id
  }
  try {

    const address = await Address.create(payload);
    return res.status(200).json({ message: "Address Added!", data: address, status: 1 });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getAddress = async (req, res, next) => {
  const userId = req.user_id;

  try {

    const addresses = await Address.findAll({ where: { userId: userId } })

    return res.status(200).json({ message: "Addresses fetched successfully!", data: addresses, status: 1, length: addresses.length })

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.editAddress = async (req, res, next) => {
  const userId = req.user_id;
  const addressId = req.body.addressId;

  try {
    const address = await Address.findOne({ where: { id: addressId, userId: userId } })

    if (address) {
      address.address = req.body.address || address.address;
      address.icon = req.body.icon || address.icon;
      address.address_type = req.body.address_type || address.address_type;
      // address.latitude = req.body.latitude || address.latitude;
      // address.longitude = req.body.longitude || address.longitude;
      try {
        const result = await address.save();
        return res.status(200).json({ message: "Address Updated!", data: result, status: 1 });
      } catch (err) {
        console.log(err)
        return res.status(404).json({ error: "Address Not Updated!", status: 0 });
      }
    } else {
      return res.status(404).json({ error: "No address found for the given id!", status: 0 })
    }
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.activateAddress = async (req, res, next) => {
  const addressId = req.body.addressId;
  const userId = req.user_id;

  try {

    const address = await Address.findOne({ where: { id: addressId, userId: userId } })

    if (address.is_active === true) {
      return res.status(200).json({ message: "Address is already active!", status: 0 })
    } else {
      address.is_active = 1;
      const otherAddresses = await Address.findAll({ where: { is_active: 1, userId: userId } })
      if (otherAddresses.length !== 0) {
        for (let i = 0; i < otherAddresses.length; i++) {
          otherAddresses[i].is_active = 0;
          await otherAddresses[i].save();
        }
      }
      const result = await address.save();
      return res.status(200).json({ message: "Address Activated!", data: result, status: 1 })
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.deleteAddress = async (req, res, next) => {
  const userId = req.user_id;
  const addressId = req.body.addressId;

  try {

    await Address.destroy({ where: { id: addressId, userId: userId } })

    return res.status(200).json({ message: "Address Deleted Successfully!", status: 1 });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.postReview = async (req, res, next) => {
  const userId = req.user_id;
  const catererId = req.body.catererId;
  const orderId = req.body.orderId;
  try {
    const rev = await Feedback.create({
      rating: req.body.rating,
      review: req.body.review,
      userId: userId,
      catererId: catererId,
      orderId: orderId
    })

    const order = await Order.update({ is_reviewed: 1 }, { where: { id: orderId } });
    return res.status(200).json({ message: "Feedback Submitted!", data: rev, status: 1 })
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.search = async (req, res, next) => {
  const term = req.query.term;
  const key = req.params.key;
  // key->1   categories
  // key->2   items
  // key->3   caterers
  try {
    if (key == 1) {
      const totalResults = await Category.count({ where: { title: { [Op.like]: '%' + term + '%' } } })
      const results = await Category.findAll({ include: Item, where: { title: { [Op.like]: '%' + term + '%' } } });

      return res.status(200).json({
        message: 'Fetched Categories Successfully!',
        results: results,
        totalCaterers: totalResults, status: 1
      })
    }


    else if (key == 2) {
      const totalResults = await Item.count({ where: { title: { [Op.like]: '%' + term + '%' } } })
      const results = await Item.findAll({ include: Category, where: { title: { [Op.like]: '%' + term + '%' } } });

      return res.status(200).json({
        message: 'Fetched Items Successfully!',
        results: results,
        totalItems: totalResults, status: 1
      })
    }


    else if (key == 3) {
      const totalResults = await Store.count({ where: { name: { [Op.like]: '%' + term + '%' } } })
      const results = await Store.findAll({ where: { name: { [Op.like]: '%' + term + '%' } } });

      return res.status(200).json({
        message: 'Fetched Caterers Successfully!',
        results: results,
        totalCaterers: totalResults, status: 1
      })
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}

exports.getDeliveryFee = (req, res, next) => {
  const lat1 = req.body.lat;
  const lon1 = req.body.lng;
  let deliveryFee;
  Store.findOne({
    where: {
      userId: req.body.userId
    }
  })
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
      if (d < 5) {
        deliveryFee = 2.5
      } else if (d < 10) {
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

exports.postOrder = async (req, res, next) => {
  const dateTime = req.body.dateTime;
  const userId = req.user_id,
    catererId = req.body.catererId,
    items = req.body.items,
    order_type = req.body.orderType,
    amount = req.body.totalAmount,
    date = dateTime.split(' ')[0],
    time = dateTime.split(' ')[1],
    discount = req.body.discount,
    addressId = req.body.addressId,
    instructions = req.body.instructions;
  const netAmount = amount - discount;
  try {
    const order = await Order.create({
      order_type: order_type,
      catererId: catererId,
      userId: userId,
      amount: amount,
      date: date,
      time: time,
      discount: discount,
      netAmount: netAmount,
      addressId: addressId,
      instructions: instructions
    })
    // let arr  = [],
    //     keys = Object.keys(items);

    // for(let i=0,n=keys.length;i<n;i++){
    //         let key  = keys[i];
    //         arr[key] = items[key];
    //     }
    for (let j = 0; j < items.length; j++) {
      if (items[j]) {
        const orderItems = await OrderItem.create({
          itemId: items[j].id,
          orderId: order.id,
          quantity: items[j].qty,
          itemTotal: (items[j].qty) * (items[j].price)
        });

      }
    }

    const message_notification = {
      notification: {
        title: 'Order Placed',
        body: 'Order placed successfully.'
      }
    };

    try {

      const store = await Store.findOne({ where: { userId: catererId } });
      const token = await Token.findOne({ where: { userId: userId } });

      notifications.createNotification(token.device_token, message_notification);

      const data = {
        title: 'Order Placed',
        body: `You have placed order at ${store.name}`,
        type: 0
      }
      await Notification.create(data);
      
    } catch (error) {
      console.log(error);
      return res.status(404).json({
        ErrorMessage: 'Device token not found or valid!',
        status: 0
    });
    }

    return res.status(200).json({ message: "Order has been Placed!", order: order, status: 1 });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }

}

exports.getOrders = async (req, res, next) => {
  const userId = req.user_id;
  const key = req.params.key;
  try {

    if (key == 1) {

      const currentOrders = await Order.findAll({
        where: {
          userId: userId,
          status: { [Op.between]: [0, 3] }
        },
        include: [{
          model: OrderItem,
          include: {
            model: Item
          }
        }, Address, {
          model: User,
          as: 'caterer',
          foreignKey: 'catererId',
          include: { model: Store, as: 'store', foreignKey: 'catererId'}
        }]
      })

      return res.status(200).json({ message: "Orders Fetched!", length: currentOrders.length, orders: currentOrders, status: 1 })
    }
    else if (key == 2) {

      const pastOrders = await Order.findAll({
        where: {
          userId: userId,
          status: { [Op.between]: [4, 6] }
        },
        include: [{
          model: OrderItem,
          include: {
            model: Item
          }
        }, Address, {
          model: User,
          as: 'caterer',
          foreignKey: 'catererId',
          include: { model: Store, as: 'store', foreignKey: 'catererId'}
        }]
      })

      return res.status(200).json({ message: "Orders Fetched!", length: pastOrders.length, orders: pastOrders, status: 1 })
    } else {
      return res.status(400).json({ message: "Enter Valid Key!", status: 0 })
    }


  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.cancelOrder = async (req, res, next) => {
  const userId = req.user_id;
  const orderId = req.body.orderId;

  try {

    const order = await Order.findOne({ where: { userId: userId, id: orderId } })

    if (order) {

      order.status = 5;
      const result = await order.save();

      const message_notification = {
        notification: {
          title: 'Order Cancelled',
          body: 'Order cancelled successfully.'
        }
      };
  
      try {
  
        const store = await Store.findOne({ where: { userId: catererId } });
        const token = await Token.findOne({ where: { userId: userId } });
  
        notifications.createNotification(token.device_token, message_notification);
  
        const data = {
          title: 'Order Cancelled',
          body: `You have cancelled your order at ${store.name}`,
          type: 5
        }
        await Notification.create(data);
        
      } catch (error) {
        console.log(error);
        return res.status(404).json({
          ErrorMessage: 'Device token not found or valid!',
          status: 0
      });
      }
      return res.status(200).json({ message: "Order Cancelled!", result: result, status: 1 })
    } else {
      return res.status(400).json({ message: "No order found", status: 0 })
    }


  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.postFav = async (req, res, next) => {
  const userId = req.user_id;
  const catererId = req.body.catererId;

  try {
    const fav = await Favourites.create({ userId: userId, catererId: catererId })
    return res.status(200).json({ message: "Added to Favourites!", result: fav, status: 1 })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.getFav = async (req, res, next) => {
  const userId = req.user_id;

  try {

    const favs = await Favourites.findAll({ where: { userId: userId } });
    if (favs.length === 0) {
      return res.status(400).json({ message: "No Favourites Found!", status: 1 })
    }
    let caterers = [];
    for (let i = 0; i < favs.length; i++) {
      const cat = await User.findByPk(favs[i].catererId);
      caterers.push(cat);
    }
    return res.status(200).json({ message: "Favourites Caterers Found!", result: caterers, status: 1 })

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.deleteFav = async (req, res, next) => {
  const userId = req.user_id;
  const catererId = req.body.id;
  try {

    await Favourites.destroy({ where: { catererId: catererId, userId: userId } })
    return res.status(200).json({ message: "Removed from favourites!", status: 1 })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.applyToken = async (req, res, next) => {
  const price = req.body.price;
  const couponCode = req.body.couponCode;
  let updatedPrice,
    discAmount;

  try {

    const coupon = await Coupon.findOne({ where: { code: couponCode } });
    if (!coupon) {
      return res.status(400).json({ message: "Coupon Code is invalid!", status: 0 })
    } else {
      if (coupon.is_percent == 1) {

        discAmount = price * ((coupon.value) / 100)
        updatedPrice = price - discAmount;

      } else {
        if (price < coupon.value) {
          updatedPrice = 0;
          discAmount = price;
        } else {
          discAmount = coupon.value
          updatedPrice = price - discAmount;
        }

      }
      return res.status(200).json({ message: "Price updated!", updatedPrice: updatedPrice, discAmount: discAmount })
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }

}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err))
}