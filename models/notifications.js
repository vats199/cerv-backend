const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('notifications' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING(100),
        defaultValue: null,
    },
    body: {
        type: Sequelize.TEXT,
        defaultValue: null,
    },
    status: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: '0 = order_placed, 1 = caterer_accepted, 2 = preparing_food, 3= dispatched, 4 = rejected, 5 = cancelled, 6 = delivered, 7 = paymentSuccess, 8 = paymentFailed'
    },
    is_seen: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
        comment: '0 = Not_seen, 1 = Seen'
    },
    createdAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    }
    }
)