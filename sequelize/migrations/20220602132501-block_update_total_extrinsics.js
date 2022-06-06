'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        `update block b
          set total_extrinsics = (select count(*) from extrinsic e where e.block_number = b.block_number);
        `,
        { transaction },
      );

      await queryInterface.changeColumn(
        'block',
        'total_extrinsics',
        {
          type: Sequelize.DataTypes.INTEGER,
          defaultValue: 0,
        },
        {
          transaction,
        },
      );

      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {},
};
