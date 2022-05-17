const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('coupons' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING
    },
    description: {
        type: Sequelize.TEXT
    },
    expiry: {
        type: Sequelize.DATE
    },
    is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: 1
    },
    code: {
        type: Sequelize.STRING 
    },
    is_percent: {
        type: Sequelize.BOOLEAN
    },
    value: {
        type: Sequelize.FLOAT
    },
    createdAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    }
    }
)