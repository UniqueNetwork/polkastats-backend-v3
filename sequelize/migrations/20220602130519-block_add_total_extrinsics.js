'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('block', 'total_extrinsics', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('block', 'total_extrinsics');
  },
};
