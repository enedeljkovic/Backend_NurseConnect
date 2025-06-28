
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const SolvedQuiz = sequelize.define('SolvedQuiz', {
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quizid'
  },
  correct: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

module.exports = SolvedQuiz;
