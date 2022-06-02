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
      FROM block
      ORDER BY block.block_number DESC;
      `, { transaction });

      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(`DROP VIEW public.view_last_block;`, { transaction });

      await queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW public.view_last_block
        AS SELECT block.block_number,
            vceb.count_block_number AS event_count,
            v.count_extrinsic AS extrinsic_count,
            block."timestamp"
          FROM block
            LEFT JOIN view_count_event_block vceb ON block.block_number = vceb.block_number
            LEFT JOIN view_count_extrinsic_block v ON block.block_number = v.block_number
          ORDER BY block.block_number DESC;
      `, { transaction });

      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },
};
