const Sequelize = require('sequelize');
const database = require('../config/database');
const db = require('../config/database');

const User = require('./users');
const Movie = require('./movie');

const Favorites = db.define('favorites', {

            id: {
                type: Sequelize.INTEGER, 
            primaryKey: 1, 
            autoIncrement : 1
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            movie_id: {
                type: Sequelize.INTEGER
            },       
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'movie_id']
        }
    ]
}, 
{underscored: true});

Favorites.belongsTo(User, {foreignKey: 'user_id', targetKey: 'id'});
Favorites.belongsTo(Movie, {foreignKey: 'movie_id', targetKey: 'id'});

module.exports = Favorites;