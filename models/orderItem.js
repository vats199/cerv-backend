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
      },
      createdAt: {
          type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      },
      updatedAt: {
          type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      }
    }
)