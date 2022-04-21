const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('favourite' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    }
    },
    {
      timestamps: true,
    }
)