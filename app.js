const express = require('express');

const bodyParser = require('body-parser');

const cors = require('cors');

const User = require('./models/user');
const Store = require('./models/store');
const Driver = require('./models/driver');
const Item = require('./models/item');
const Category = require('./models/category');


const app = express();
const config = require('./util/config');
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

const Auth = require('./routes/auth');
const itemRoutes = require('./routes/item');

app.use('/users', Auth);
app.use('/caterer', itemRoutes);


const db = require('./util/database');

Store.belongsTo(User);
Driver.belongsTo(Store);
Category.belongsTo(User);
Item.belongsTo(User);
Item.belongsTo(Category);


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