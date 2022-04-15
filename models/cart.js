const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('cart',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
}, {
    timestamps: true
})
