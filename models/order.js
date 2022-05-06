const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('order' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    status: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: '0 = order_placed, 1 = caterer_accepted, 2 = preparing_food, 3= dispachted, 4 = delivered, 5 = cancelled, 6 = rejected'
    },
    order_type : {
        type : Sequelize.ENUM('Delivery', 'PickUp'),
    },
    amount :{
        type : Sequelize.FLOAT,
    },
    date_time: {
        type: Sequelize.TEXT
    },
    instructions: {
        type: Sequelize.TEXT
    }
    },
    {
      timestamps: true,
    }
)