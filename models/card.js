const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('card' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    card_id: {
        type: Sequelize.STRING(45),
        allowNull: false
    }
    },
    {
      timestamps: true,
    }
)