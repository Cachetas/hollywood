const Sequelize = require('sequelize');
const database = require('../config/database');
const db = require('../config/database');

const Activation = db.define('activation', {
        id: {
            type: Sequelize.INTEGER, 
            primaryKey: 1, 
            autoIncrement : 1
            
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(100),
            allowNull: true,
            validate: {
                isEmail:true
            },
            unique: {
                args: true,
                msg: 'Email já existe!'
            }
          },
        password: {
            type: Sequelize.STRING(300),
            allowNull: false,
        },
        admin: {
            type: Sequelize.BOOLEAN
        },
    activation_link: {
        type: Sequelize.STRING(200),
        allowNull: false
    
    }
        

}, {underscored: true});



module.exports = Activation;