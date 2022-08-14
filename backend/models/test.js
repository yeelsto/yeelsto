const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const test = sequelize.define('test', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        mimetype: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
        {}
    );

    return test;
}