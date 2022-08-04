'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('collections', 'properties', {
        type: Sequelize.DataTypes.JSONB,
        defaultValue: []  
      }),
      queryInterface.addColumn('collections', 'attributes_schema', {
        type: Sequelize.DataTypes.JSONB,
        defaultValue: {}  
      }),
    ]) 
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.removeColumn('collections', 'properties'),
      await queryInterface.removeColumn('collections', 'attributes_schema'),
    ]);
  }
};
