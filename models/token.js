const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('token' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
      token: {
        type: Sequelize.TEXT
      },
      refreshToken: {
        type: Sequelize.TEXT
      },
      token_type: {
        type: Sequelize.ENUM('access_token'),
        defaultValue: 'access_token'
      },
      status: {
          type: Sequelize.ENUM('active', 'expired'),
          allowNull: false,
          defaultValue: 'active'
      },
      expiry: {
        type: Sequelize.STRING(30),
        defaultValue: null,
    },
    login_count: {
        type: Sequelize.INTEGER,
        defaultValue: null,
    },
    createdAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    }
    }
)