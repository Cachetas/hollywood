const Sequelize = require('sequelize');
const database = require('../config/database');
const db = require('../config/database');

const Movie = db.define('movie', {
        id: {
            type: Sequelize.INTEGER, 
            primaryKey: 1, 
            autoIncrement : 1
        },
        trailer: {
            type: Sequelize.STRING(100)
        } ,
        movie_title: {
            type: Sequelize.STRING(50)
        },
        description: {
            type: Sequelize.STRING(10000)
        },

        actors: {
            type: Sequelize.STRING(1000)
        },

        year: {
            type: Sequelize.INTEGER
        },

        director : {
            type: Sequelize.STRING(30)
        }
}, {underscored: true});


module.exports = Movie;