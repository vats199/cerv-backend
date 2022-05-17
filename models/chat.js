const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('chat' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    chat_name: {
        type: Sequelize.STRING,
    },
    lastMessage:{
        type: Sequelize.TEXT
    },
    createdAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    }
    }
)