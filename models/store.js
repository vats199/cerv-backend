const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('store' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    license_num: {
        type: Sequelize.STRING,

    },
    license_image: {
        type: Sequelize.STRING(100),
        defaultValue: null
    },
    address: {
        type: Sequelize.STRING
    },
    bio: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    category: {
        type: Sequelize.STRING
    },
    is_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    },
    order_type: { 
        type: Sequelize.TINYINT(1),
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: '0 = Delivery, 1 = Pickup, 2 = Both Delivery and Pickup',
    }
},
{
    timestamps: true
})