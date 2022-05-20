'use strict';

// - Почему она называется view_events
// - К ней есть запросы с фронта или можно удалить
// - Название новой таблицы balance_transactions, balance_updates, block_balance, block_transactions


module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('block_transactions', {
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
    // todo: Дропнуть вью

  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('block_transactions');
  }
};
