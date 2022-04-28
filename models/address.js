const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('address' , {
  address: {
        type: Sequelize.TEXT
    },
  icon: {
        type: Sequelize.TEXT
    },
  address_type: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: '0 = Home, 1  = Office, 2 = Location'
    },
    is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    }
  // latitude : {
  //       type : Sequelize.STRING
  //   },
  // longitude : {
  //       type : Sequelize.STRING
  //   }
    },
    {
      timestamps: true,
    }
)