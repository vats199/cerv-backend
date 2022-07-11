const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    status: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: '0 = order_placed, 1 = caterer_accepted, 2 = preparing_food, 3= dispatched, 4 = delivered, 5 = cancelled, 6 = rejected'
    },
    order_type: {
        type: Sequelize.ENUM('Delivery', 'PickUp'),
    },
    amount: {
        type: Sequelize.FLOAT,
    },
    date: {
        type: Sequelize.DATEONLY
    },
    time: {
        type: Sequelize.TIME
    },
    address: {
        type: Sequelize.TEXT
    },
    address_icon: {
        type: Sequelize.STRING
    },
    latitude: {
        type: Sequelize.DECIMAL(10, 7)
    },
    longitude: {
        type: Sequelize.DECIMAL(10, 7)
    },
    discount: {
        type: Sequelize.FLOAT,
    },
    netAmount: {
        type: Sequelize.FLOAT,
    },
    instructions: {
        type: Sequelize.TEXT
    },
    is_reviewed: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    },
    createdAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    }
}
)