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


const app = express();

const fileStorage = multer.diskStorage({
  destination: (req,file,cb) => {
      cb(null, 'images');
  },
  filename: (req, file, cb) => {
      cb(null, new Date().toISOString() + '-' + 'cerv');
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
  res.status(status).json({message: message, data: data, status: 0})
})

const db = require('./util/database');

Store.belongsTo(User);
Driver.belongsTo(Store);
Category.belongsTo(User);
Item.belongsTo(User);
Item.belongsTo(Category);
Address.belongsTo(User);
Feedback.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
Feedback.belongsTo(User, { foreignKey: "catererId", targetKey: "id" });
Token.belongsTo(User);
Banner.belongsTo(User);


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