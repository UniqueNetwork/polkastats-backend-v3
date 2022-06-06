'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(`DROP VIEW public.view_last_block;`, { transaction });

      await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW public.view_last_block
      AS SELECT block.block_number,
        block.total_events AS event_count,
        block.total_extrinsics AS extrinsic_count,
        block."timestamp"
      FROM block;
      `, { transaction });

      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(`DROP VIEW public.view_last_block;`, { transaction });

      await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW public.view_last_block
      AS SELECT block.block_number,
        block.total_events AS event_count,
        block.total_extrinsics AS extrinsic_count,
        block."timestamp"
      FROM block
      ORDER BY block.block_number DESC;
      `, { transaction });

      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  }
};
