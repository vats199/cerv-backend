const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Account = sequelize.define('account', {
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role: {
        type: Sequelize.STRING,
        enum: ["ROLE_CUSTOMER", "ROLE_CATERER"],
        allowNull: false
    },
    accountVerifyToken: Sequelize.STRING,
    accountVerifyTokenExpiration: Sequelize.DATE,
    isVerified: {
        type: Sequelize.BOOLEAN,
        default: false
    },
    
}, { timestamps: true })

module.exports = Account;