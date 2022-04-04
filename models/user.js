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
        allowNull: false,
        validate: {
            notEmpty: true
        },
        comment: '0 = Caterer, 1 = Customer, 2 = DeliveryBoy',
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.STRING(100),
        defaultValue: null
    },
    pNumber: {
        type: Sequelize.STRING
    },
    is_verify: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    },
    is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    },
    resetToken:{
        type: Sequelize.TEXT,
        defaultValue: null
    },
    resetTokenExpiration: {
        type: Sequelize.DATE,
        defaultValue: null
    }
},
{
    timestamps: true
})