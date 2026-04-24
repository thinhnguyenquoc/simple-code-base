const { sequelize } = require('../config/database');
const User = require('./User');
const Friendship = require('./Friendship');

// Set up associations
Friendship.associate({ User });

// Sync database
async function syncDatabase() {
  try {
    await sequelize.sync({ force: false }); // Set force: true to drop and recreate tables
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

module.exports = {
  sequelize,
  User,
  Friendship,
  syncDatabase,
};