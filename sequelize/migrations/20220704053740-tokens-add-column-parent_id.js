'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      
      await queryInterface.addColumn('tokens', 'parent_id', {
        type: Sequelize.DataTypes.BIGINT,
        defaultValue: null,
        allowNull: true
      }, {
        transaction
      })
            
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {

      await queryInterface.removeColumn('tokens', 'parent_id', {
        transaction
      })
      
      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  }
};
