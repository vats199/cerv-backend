const User = require('../models/user');
const Driver = require('../models/driver');
const Chat = require('../models/chat');
const Message = require('../models/message');
const cloudinary = require('../util/image');
const { v4: uuidv4 } = require('uuid');

const crypto = require('crypto');
const key = process.env.encKey;
const IV_LENGTH = 16;

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
            if(chat.lastMessage){
                chat.lastMessage = decrypt(chat.lastMessage)
            }
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

        for(let i=0; i<chats.length; i++){
            if(chats[i].dataValues.lastMessage){
                chats[i].dataValues.lastMessage = decrypt(chats[i].dataValues.lastMessage);
            }
        }
            return res.status(200).json({message: "Chats fetched Successfully!" ,
                                         length: chats.length ,
                                         chats: chats.sort((a,b) => (a.updatedAt < b.updatedAt) ? 1 : ((b.updatedAt < a.updatedAt) ? -1 : 0)), 
                                         status: 1})
        
    } catch (err) {
        console.log(err);
    return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
    }
}

exports.sendMessage = async (req,res,next) => {
    const userId = req.user.id;
    const content = encrypt(req.body.content);
    const chatId = req.body.chatId;

    const newMessage = {
        senderId: userId,
        content: content,
        chatId: chatId
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

exports.allMessages = async (req,res,next) => {
    // const userId = req.user.id;
    const chatId = req.params.chatId;

    try {

        const messages = await Message.findAll({ where: { chatId: chatId } });

        for(let i=0; i < messages.length; i++){
            messages[i].content = decrypt(messages[i].content);
        }

        return res.status(200).json({message: "Messages fetched!", 
                                     data: messages.sort((a,b) => (a.createdAt > b.createdAt) ? 1 : ((b.createdAt > a.createdAt) ? -1 : 0)), 
                                     status: 1, 
                                     total: messages.length});
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err || 'Something went wrong!', status: 0 });
    }
}

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
   }
   
function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
   }