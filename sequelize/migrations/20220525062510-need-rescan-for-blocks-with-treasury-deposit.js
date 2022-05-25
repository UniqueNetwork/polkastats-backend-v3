'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(
      `UPDATE block SET need_rescan=true WHERE block_number IN (SELECT block_number FROM event WHERE section='treasury' AND method='Deposit');`
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
