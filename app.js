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
const Coupon = require('./models/coupon');
const Chat = require('./models/chat');
const Message = require('./models/message');

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


app.use(cors());

app.use(express.json()); 

app.use(bodyParser.urlencoded({ extended: true }))

app.use(bodyParser.json());

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

const PORT = process.env.PORT || 5000;


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
const ChatRoutes = require('./routes/chat');
const MessageRoutes = require('./routes/message');

app.use('/users', Auth);
app.use('/caterer', itemRoutes);
app.use('/', customerRoutes);
app.use('/chat', ChatRoutes);
app.use('/message', MessageRoutes);

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
Chat.belongsTo(User, { foreignKey: "userId", targetKey: "id" });
User.hasMany(Chat, { foreignKey: "userId", targetKey: "id" });
Chat.belongsTo(Driver, { foreignKey: "driverId", targetKey: "id" });
Driver.hasMany(Chat, { foreignKey: "driverId", targetKey: "id" });
Message.belongsTo(User, { foreignKey: "senderId", targetKey: "id" });
User.hasMany(Message, { foreignKey: "senderId", targetKey: "id" });
Message.belongsTo(Chat, { foreignKey: "chatId", targetKey: "id" });
Chat.hasMany(Message, { foreignKey: "chatId", targetKey: "id" });
// Message.hasOne(Chat, { foreignKey: "latestMessageId", targetKey: "id" });

db.sequelize
  // .sync({force: true})
  .sync()
  .then(_database => {
    console.log('Database Connected Successfully.')
  })
  .then((_result) => {
    const server = app.listen(PORT, (_port) => {
                            console.log('Server running on port : ' + PORT);
                        });
    const io = require('socket.io')(server, {
      pingTimeout: 60000,
      cors: {
        origin: "http://localhost:3000"

      }
    })
    io.on("connection", (socket)=>{
      console.log('Connected to socket.io');
      
      socket.on('setup', (userData)=>{
        socket.join(userData.id);
        socket.emit("connected");
      })

      socket.on('join chat', (room)=>{
        socket.join(room) 
      })

      socket.on('typing', (room)=>socket.in(room).emit("typing"))
      socket.on('stop typing', (room)=>socket.in(room).emit("stop typing"))

      socket.on('new message', (newMessageRecieved)=>{
        let chat = newMessageRecieved.chat;
        
        if(!chat.userId || !chat.driverId) return console.log('Users are not there!');

        if(newMessageRecieved.is_driver == 1){
          if(chat.driverId == newMessageRecieved.senderId){
            socket.in(chat.userId).emit("message recieved", newMessageRecieved);
          }
        }else {
          if(chat.userId == newMessageRecieved.senderId){
            socket.in(chat.driverId).emit("message recieved", newMessageRecieved);
          }
        }

      })
      socket.off('setup', ()=>{
        socket.leave(userData.id);
      })

    })
  })
  .catch(err => {
    console.log(err);
  });



// app.listen(PORT, () => {
//     console.log('SERVER IS RUNNING ON PORT : 3000');
// });