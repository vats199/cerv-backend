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
      }
    },
    {
      timestamps: true,
    }
)