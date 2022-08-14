const Sequelize = require('sequelize');
require('dotenv').config()

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: 'postgres',
    logging: false,
    define: {
        underscored: true,
        freezeTableName: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});

const test = require('./test')(sequelize)

const db = {
    test,
    sequelize,
};

module.exports = db;