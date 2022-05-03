const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('item' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
      title: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      categoryName: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT
      }
    },
    {
      timestamps: true,
    }
)