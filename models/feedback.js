const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('feedback' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    rating: { 
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    review: {
        type: Sequelize.STRING
    }
})