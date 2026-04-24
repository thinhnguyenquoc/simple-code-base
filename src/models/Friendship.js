const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Friendship = sequelize.define('Friendship', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'friendships',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'friendId'],
    },
  ],
});

// Associations
Friendship.associate = (models) => {
  Friendship.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Friendship.belongsTo(models.User, { foreignKey: 'friendId', as: 'friend' });
};

module.exports = Friendship;