const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('message' , {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
    },
    is_seen: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0,
        comment: '0 = Not_seen, 1 = Seen'
    },
    createdAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
    updatedAt: {
        type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    }
    }
)