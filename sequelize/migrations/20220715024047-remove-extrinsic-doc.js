'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('extrinsic', 'doc');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('extrinsic', 'doc', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: false,
    });
  },
};
