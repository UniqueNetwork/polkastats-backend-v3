'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      update collections 
      set schema_version = 'ImageUrl'
      where schema_version = 'ImageURL';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      update collections 
      set schema_version = 'ImageURL'
      where schema_version = 'ImageUrl';
    `);
  },
};
