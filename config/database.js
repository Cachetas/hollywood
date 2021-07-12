const Sequelize = require ('sequelize');
module.exports = new Sequelize ('hollywood', 'postgres', '12345678',{
host: 'localhost',
dialect: 'postgres',
/* dialectOptions: {
   supportBigNumbers: 1,
   supportBigNumberStrings: 1
 }, */
//logging: 1,
define: {
   timestamps: 0
},
operatorsAliases: 0,
pool: {
   max: 5,
   min: 0,
   acquire: 30000,
   idle: 10000
},
});