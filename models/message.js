const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('message' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
    },
    is_driver: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    }
    },
    {
      timestamps: true,
    }
)