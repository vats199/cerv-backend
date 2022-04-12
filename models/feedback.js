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
        type: Sequelize.ENUM,
        values: ['0','1','2','3','4','5'],
        defaultValue: '0'
    },
    review: {
        type: Sequelize.STRING
    }
})