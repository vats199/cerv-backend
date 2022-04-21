const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('orderItem' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
      quantity: {
        type: Sequelize.INTEGER
      },
      itemTotal: {
          type: Sequelize.FLOAT
      }
    },
    {
      timestamps: true,
    }
)