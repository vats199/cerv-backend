const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('cartItem',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
}, {
    timestamps: true
})
