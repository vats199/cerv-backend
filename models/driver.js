const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('driver' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    role: { 
        type: Sequelize.TINYINT(1),
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: '0 = Caterer, 1 = Customer, 2 = DeliveryBoy',
    },
    name: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.STRING(100),
        defaultValue: null
    },
    license_number: {
        type: Sequelize.STRING
    }
})