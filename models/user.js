// const Sequelize = require('sequelize')
// const sequelize = require('../util/database')

// const address = {
//     houseNo: Sequelize.NUMBER,
//     aptName: Sequelize.STRING,
//     street: Sequelize.STRING,
//     city: Sequelize.STRING,
//     zip: Sequelize.STRING
// }

// const User = sequelize.define('user', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     name: Sequelize.STRING
// })

// module.exports = User;

const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('user' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    role: { 
        type: Sequelize.TINYINT(1),
        allowNull: true,
        comment: '0 = Caterer, 1 = Customer, 2 = DeliveryBoy, 3 = admin',
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.TEXT,
        defaultValue: null
    },
    country_code: {
        type: Sequelize.STRING
    },
    phone_number: {
        type: Sequelize.STRING
    },
    stripe_id: {
        type: Sequelize.TEXT
    },
    is_verify: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    },
    is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    },
    createdAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    }
})