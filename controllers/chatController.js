const User = require('../models/user');
const Store = require('../models/store')
const Item = require('../models/item');
const Address = require('../models/address');
const Banner = require('../models/banner');
const Category = require('../models/category');
const Feedback = require('../models/feedback');
const Order = require('../models/order');
const Driver = require('../models/driver');
const Chat = require('../models/chat');
const Message = require('../models/message');
const OrderItem = require('../models/orderItem');
const Favourites = require('../models/favourites');
const Coupon = require('../models/coupon');
const cloudinary = require('../util/image');
const { v4: uuidv4 } = require('uuid')

const {Op} = require('sequelize');

const db = require('../util/database');

const fs = require('fs')
const path = require('path');

exports.getChat = async (req,res,next) => {
    const driverId = req.body.driverId;
    const userId = req.user.id;

    try {
        
        const driver = await Driver.findByPk(driverId)
        const chat = await Chat.findOne({where: { driverId: driverId, userId: userId }});

        if(chat){
            return res.status(200).json({message: "Chat fetched Successfully!", chat: chat, status: 1})
        } else {
            let chatData = {
                chat_name : req.user.name + "'s Chat with " + driver.name,
                userId : userId,
                driverId: driverId
            }
            const newChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({id: newChat.id});

            return res.status(200).json({message: "Chat created and fetched Successfully!" , chat: fullChat, status: 1})

        }

    } catch (err) {
        console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
    }
}

exports.getChats = async (req,res,next) => {
    const userId = req.user.id;

    try {
        
        const chats = await Chat.findAll({ include: [{ model: User , attributes: ['name', 'image'] }, { model: Driver , attributes: ['name', 'image'] }], where: { userId: userId }});

            return res.status(200).json({message: "Chats fetched Successfully!" ,
                                         length: chats.length ,
                                         chats: chats.sort((a,b) => (a.createdAt < b.createdAt) ? 1 : ((b.createdAt < a.createdAt) ? -1 : 0)), 
                                         status: 1})
        
    } catch (err) {
        console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
    }
}
exports.sendMessage = async (req,res,next) => {
    const userId = req.user.id;
    const content = req.body.content;
    const chatId = req.body.chatId;

    const newMessage = {
        sender: userId,
        content: content,
        chat: chatId
    }

    try {

        const message = await Message.create(newMessage);
        
        const chat = await Chat.findByPk(chatId);

        chat.lastMessage = content;

        chat.save();
                
        return res.status(200).json({message: "Message sent Successfully!", data: message, status: 1});
        
    } catch (err) {
        console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
    }
}