const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Student = sequelize.define('Student', { // Ovo može ostati u jednini
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prezime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kod: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'students',  // Eksplicitno navodimo ime tablice
    freezeTableName: true,  // Sprečava Sequelize da mijenja ime tablice
    timestamps: false
});

module.exports = Student;
