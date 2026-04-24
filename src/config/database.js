const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize('simple_code_base', 'postgres', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: console.log, // Set to false to disable logging
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

module.exports = { sequelize, testConnection };