const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('banner' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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