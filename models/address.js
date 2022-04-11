const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('address' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
      title: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      }
    },
    {
      timestamps: true,
    }
)