'use strict';

// Что такое extrinsic
// Обсудить event.method и Transfer, Deposit, Withdraw
// Обсудить fee|amount
// 

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('block_transactions', { // block_balances
      block_index: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      block_number: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      amount: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: true,
      },
      fee: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: true,
      },
    });

    // todo: Заполить данными из view_events
    // todo: Дропнуть вью или врапнуть таблицу

  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('block_transactions');
  }
};
