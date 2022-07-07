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
const Token = require('../models/token')
const Coupon = require('../models/coupon');
const Notification = require('../models/notifications');
const notifications = require('../util/notifications');

const fs = require('fs')
const path = require('path')
const S3 = require('./s3')
const { Op } = require('sequelize')

const cloudinary = require('../util/image');
const { v4: uuidv4 } = require('uuid');
const Driver = require('../models/driver');

exports.getProfile = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (role != 0) {
      return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
    }
    const user = await User.findOne({ where: { id: req.user_id } });
    const store = await Store.findOne({ where: { catererId: req.user_id } });

    if (!user) {
      const error = new Error("Couldn't Find the Profile!");
      error.statusCode = 404;
      throw error;
    }
    if (!store) {
      const error = new Error("Couldn't Find the Store!");
      error.statusCode = 404;
      throw error;
    }
    else {

      const driver = await Driver.findOne({ where: { storeId: store.id } })

      const profileData = {
        name: user.name,
        image: user.image,
        email: user.email,
        countryCode: user.country_code,
        phoneNumber: user.phone_number
      }
      profileData.store = store;
      profileData.driver = driver;
      return res.status(200).json({ message: "Found Profile!", data: profileData, status: 1 })
    }

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}

exports.getCategories = async (req, res, next) => {

  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const catererId = req.user_id;

  try {

    const categories = await Category.findAll({ where: { userId: catererId }, include: [Item] });

    return res.status(200).json({ message: "Categories fetched successfully!", categories: categories, length: categories.length, status: 1 })

  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.getCategory = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const categoryId = req.params.catId;
  const catererId = req.user_id;
  try {

    const category = await Category.findByPk(categoryId, { include: [Item] });
    const items = await Item.findAll({ where: { categoryId: categoryId, userId: catererId } })

    return res.status(200).json({ message: "Items fetched successfully!", category: category, length: items.length, status: 1 })

  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.postCategory = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const title = req.body.title;
  const uploadFile = await S3.uploadFile(req.file);
  let url = uploadFile.Location;
  Category.findOne({
    where: {
      title: title,
      userId: req.user_id
    }
  }).then(async cat => {
    if (!cat) {
      const store = await Store.findOne({ where: { userId: req.user_id } })
      Category.create({
        title: title,
        image: url,
        userId: req.user_id,
        storeId: store.id
      })
        .then(category => {
          return res.status(200).json({ message: 'Category Stored!', data: category, status: 1 })
        })
        .catch(err => {
          return res.json({ error: err, status: 0 })
        })
    } else {
      return res.json({ error: "CATEGORY ALREADY EXISTS", status: 0 })
    }
  }).catch(err => {
    return res.json({ error: err, status: 0 })
  })

}

exports.editCategory = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const categoryId = req.params.catId;
  const title = req.body.title;
  const image = req.file?.path;
  let url;
  if (image) {

    const uploadFile = await S3.uploadFile(image);
    url = uploadFile.Location;

  } else {
    url = null;
  }

  try {

    const category = await Category.findByPk(categoryId);
    category.title = title || category.title;
    category.image = url || category.image;
    const updatedCategory = await category.save();

    return res.status(200).json({ message: 'Category updated!', data: updatedCategory, status: 1 })

  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.deleteCategory = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const catererId = req.user_id;
  const categoryId = req.params.catId;

  try {

    await Category.destroy({ where: { id: categoryId, userId: catererId } })

    return res.status(200).json({ message: "Category Deleted Successfully!", status: 1 });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.postItems = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const title = req.body.title;
  const desc = req.body.description;
  const image = req.file;
  try {
    const uploadFile = await S3.uploadFile(image);
    let url = uploadFile.Location;
    const store = await Store.findOne({ where: { catererId: req.user_id } })
    const categoryId = req.body.categoryId;
    const price = req.body.price;
    Category.findOne({
      where: {
        id: categoryId,
        userId: req.user_id
      }
    }).then(cat => {
      if (!cat) {
        return res.json({
          error: `No Category exists for the given name!
                                   Enter Valid Category Name!`, status: 0
        })
      } else {
        Item.create({
          title: title,
          image: url,
          description: desc,
          categoryName: cat.title,
          price: price,
          userId: req.user_id,
          categoryId: cat.id,
          storeId: store.id
        }).then(item => {
          return res.status(200).json({ message: 'Item Stored!', data: item, status: 1 })
        })
          .catch(err => {
            return res.json({ error: err, status: 0 })
          })
      }
    })

  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.editItem = (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const itemId = req.params.itemId;
  const title = req.body.title;
  const description = req.body.description;



  const price = req.body.price;

  Item.findOne({ where: { id: itemId } })
    .then(item => {
      if (item.userId === req.user_id) {
        const image = req.file

        if (image) {

          const upload = await S3.uploadFile(image);
          let url = upload.Location;
          item.image = url;
        }
        item.title = title || item.title;
        item.price = price || item.price;
        item.description = description || item.description;
        item.save();
        return res.status(200).json({ message: "Updated item successfully!", data: item, status: 1 })
      } else {
        return res.status(403).json({ error: "User is not Authorized!", status: 0 })
      }
    }).catch(err => console.log(err))
}

exports.deleteItem = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const catererId = req.user_id;
  const itemId = req.params.itemId;

  try {

    await Item.destroy({ where: { id: itemId, userId: catererId } })

    return res.status(200).json({ message: "Item Deleted Successfully!", status: 1 });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.postBanner = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const userId = req.user_id;
  const image = req.file
  const uploadFile = await S3.uploadFile(image);
  let url = uploadFile.Location;
  const data = {
    image: url,
    userId: userId
  }
  Banner.create(data)
    .then(result => {
      return res.status(200).json({ message: "Banner created Successfully!", data: result, status: 1 })
    })
    .catch(err => console.log(err))

}

exports.postCoupon = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const catererId = req.user_id;
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

  try {

    const coupon = await Coupon.create(payLoad);
    return res.status(200).json({ message: "Coupon Created!", status: 1, data: coupon })

  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.getCoupons = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const catererId = req.user_id;

  try {

    const coupons = await Coupon.findAll({ where: { catererId: catererId } });
    return res.status(200).json({ message: "Coupons Fetched!", status: 1, data: coupons })

  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }
}
exports.editCoupon = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const catererId = req.user_id;
  const couponId = req.query.couponId
  const data = req.body;

  try {

    const coupon = await Coupon.findOne({ where: { id: couponId, catererId: catererId } })

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found!", status: 0 })
    }

    coupon.title = data.title || coupon.title;
    coupon.description = data.description || coupon.description;
    coupon.expiry = data.expiry || coupon.expiry;
    coupon.code = data.code || coupon.code;
    coupon.is_percent = data.is_percent || coupon.is_percent;
    coupon.is_active = data.is_active || coupon.is_active;
    coupon.value = data.value || coupon.value;

    const resp = await coupon.save();

    return res.status(200).json({ message: "Coupon Updated!", status: 1, data: resp })

  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.deleteCoupon = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const couponId = req.body.couponId;
  const catererId = req.user_id;

  try {

    const coupon = await Coupon.findOne({ where: { id: couponId, catererId: catererId } });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found!", status: 0 })
    }
    await coupon.destroy();

    return res.status(200).json({ message: "Coupon Deleted!", status: 1 })

  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.getOrders = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const catererId = req.user_id;
  const key = req.params.key;
  try {

    if (key == 1) {

      const currentOrders = await Order.findAll({
        where: {
          catererId: catererId,
          status: { [Op.between]: [0, 3] }
        },
        include: [{
          model: OrderItem,
          include: {
            model: Item
          }
        }, Address, {
          model: User,
          as: 'user',
          foreignKey: 'userId'
        }]
      })

      return res.status(200).json({ message: "Orders Fetched!", length: currentOrders.length, orders: currentOrders, status: 1 })
    }
    else if (key == 2) {

      const pastOrders = await Order.findAll({
        where: {
          catererId: catererId,
          status: { [Op.between]: [4, 6] }
        },
        include: [{
          model: OrderItem,
          include: {
            model: Item
          }
        }, Address, {
          model: User,
          as: 'user',
          foreignKey: 'userId'
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

exports.acceptOrder = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const catererId = req.user_id;
  const orderId = req.params.orderId;

  try {

    const order = await Order.findOne({ where: { catererId: catererId, id: orderId } })

    if (order.status != 0) {
      return res.status(400).json({ message: "Order is already accepted/rejected!", status: 0 })
    }
    order.status = 1;
    const result = await order.save();

    const message_notification = {
      notification: {
        title: 'Order Accepted',
        body: 'Your order is accepted.'
      }
    };

    try {

      const store = await Store.findOne({ where: { userId: catererId } });
      const token = await Token.findOne({ where: { userId: order.userId } });

      notifications.createNotification(token.device_token, message_notification);

      const data = {
        title: 'Order Accepted',
        body: `Your order has been accepted by ${store.name}`,
        type: 1
      }
      await Notification.create(data);

    } catch (error) {
      console.log(error);
      return res.status(404).json({
        ErrorMessage: 'Device token not found or valid!',
        status: 0
      });
    }

    return res.status(200).json({ message: "Order Accepted!", result: result, status: 1 })

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}

exports.rejectOrder = async (req, res, next) => {
  const role = req.user.role;
  if (role != 0) {
    return res.status(400).json({ message: "You are not Authorized to do this!", status: 0 })
  }
  const catererId = req.user_id;
  const orderId = req.params.orderId;

  try {

    const order = await Order.findOne({ where: { catererId: catererId, id: orderId } })

    if (order.status != 0) {
      return res.status(400).json({ message: "Order is already accepted/rejected!", status: 0 })
    }
    order.status = 6;
    const result = await order.save();

    const message_notification = {
      notification: {
        title: 'Order Rejected',
        body: 'Your order is rejected.'
      }
    };

    try {

      const store = await Store.findOne({ where: { userId: catererId } });
      const token = await Token.findOne({ where: { userId: order.userId } });

      notifications.createNotification(token.device_token, message_notification);

      const data = {
        title: 'Order Rejected',
        body: `Your order has been rejected by ${store.name}`,
        type: 4
      }
      await Notification.create(data);

    } catch (error) {
      console.log(error);
      return res.status(404).json({
        ErrorMessage: 'Device token not found or valid!',
        status: 0
      });
    }

    return res.status(200).json({ message: "Order Status Updated!", result: result, status: 1 })

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
  }
}


const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err))
}