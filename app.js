const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');

const User = require('./models/user');
const Store = require('./models/store');
const Driver = require('./models/driver');
const Item = require('./models/item');
const Category = require('./models/category');
const Address = require('./models/address');
const Feedback = require('./models/feedback');
const Token = require('./models/token');
const Banner = require('./models/banner');
const Card = require('./models/card');
const Payment = require('./models/payment');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');
const Favourites = require('./models/favourites');
const Coupon = require('./models/coupon')

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req,file,cb) => {
      cb(null, 'images');
  },
  filename: (req, file, cb) => {
      cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req,file,cb) => {
  if( file.mimetype == 'image/png' || 
      file.mimetype == 'image/jpeg' || 
      file.mimetype == 'image/jpg') {
          cb(null, true);
      } else {
          cb(null, false);
      }
}

const config = require('./util/config');

app.use(cors());

app.use(express.json()); 

app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json());

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

const PORT = process.env.PORT || 3000;


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    next();
  });

app.set('view engine', 'ejs');
app.set('views', 'views');

const Auth = require('./routes/auth');
const itemRoutes = require('./routes/item');
const customerRoutes = require('./routes/customer');

app.use('/users', Auth);
app.use('/caterer', itemRoutes);
app.use('/', customerRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({message: message, data: data, statusCode:status , status: 0})
})

const db = require('./util/database');

Store.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasOne(Store, { constraints: true, onDelete: 'CASCADE' });
Driver.belongsTo(Store);
Store.hasMany(Category);
Category.belongsTo(Store);
Store.hasMany(Item);
Item.belongsTo(Store);
Category.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Category, { constraints: true, onDelete: 'CASCADE' });
Item.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Item, { constraints: true, onDelete: 'CASCADE' });
Item.belongsTo(Category, { constraints: true, onDelete: 'CASCADE' });
Category.hasMany(Item, { constraints: true, onDelete: 'CASCADE' });
Address.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Feedback.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
Feedback.belongsTo(User, { foreignKey: "catererId", targetKey: "id" });
User.hasMany(Feedback);
Token.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Banner.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Payment.belongsTo(User);
Card.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
Order.belongsTo(User, { foreignKey: "catererId", targetKey: "id" });
Order.hasMany(OrderItem);
Favourites.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
Favourites.belongsTo(User, { foreignKey: "catererId", targetKey: "id" });
Coupon.belongsTo(User, { foreignKey: "catererId", targetKey: "id" });
OrderItem.belongsTo(Item);
Item.hasMany(OrderItem);
Order.belongsToMany(Item, { through: OrderItem });
Order.belongsTo(Address);
Address.hasMany(Order);

db.sequelize
  // .sync({force: true})
  .sync()
  .then(_database => {
    console.log('Database Connected Successfully.')
  })
  .then((_result) => {
    app.listen(PORT, (_port) => {
        console.log('Server running on port : ' + PORT);
    });
  })
  .catch(err => {
    console.log(err);
  });



// app.listen(PORT, () => {
//     console.log('SERVER IS RUNNING ON PORT : 3000');
// });