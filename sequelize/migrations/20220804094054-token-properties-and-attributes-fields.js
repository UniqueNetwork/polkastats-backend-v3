'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('tokens', 'properties', {
        type: Sequelize.DataTypes.JSONB,
        defaultValue: []  
      }),
      queryInterface.addColumn('tokens', 'attributes', {
        type: Sequelize.DataTypes.JSONB,
        defaultValue: {}  
      }),
    ]) 
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.removeColumn('tokens', 'properties'),
      await queryInterface.removeColumn('tokens', 'attributes'),
    ]);
  }
};
