const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('category' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image: {
        type: Sequelize.STRING
      },
      createdAt: {
          type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      },
      updatedAt: {
          type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
      }
      
    }
)