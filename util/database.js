const {Sequelize} = require('sequelize');
const config = require('../util/config');
const db = {};

const sequelize = new Sequelize(config.MYSQL_DATABASE, config.MYSQL_USER, config.MYSQL_PASSWORD, {
    dialect: 'mysql',
    host: 'localhost',
    operatorAliases: false,

    pool: {
        max: 5, 
        min: 0, 
        acquire: 30000,
        idle: 10000
    }
})

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;