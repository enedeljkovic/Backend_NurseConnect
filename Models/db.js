const { Sequelize } = require('sequelize');

// Povezivanje s PostgreSQL bazom podataka
const sequelize = new Sequelize('NurseConnect', 'postgres', 'fdg5ahee', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // možeš promijeniti u true za debugiranje
});

module.exports = sequelize;
