const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('item' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    transaction_id: {
        type: Sequelize.STRING,
    },
    amount: {
        type: Sequelize.FLOAT,
    },
    status: {
        type: Sequelize.ENUM('PENDING', 'SUCCESS', 'FAILED'),
        defaultValue: 'PENDING',
        comment: 'PENDING, SUCCESS, FAILED'
    }
    },
    {
      timestamps: true,
    }
)