const Sequelize = require('sequelize');
const db = require('../util/database');

module.exports = db.sequelize.define('address' , {
  primary_address: {
        type: Sequelize.STRING(45)
    },
  addition_address_info: {
        type: Sequelize.TEXT
    },
  address_type: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        comment: '0 = Home, 1  = Office, 2 = Location'
    },
  latitude : {
        type : Sequelize.STRING
    },
  longitude : {
        type : Sequelize.STRING
}
    },
    {
      timestamps: true,
    }
)