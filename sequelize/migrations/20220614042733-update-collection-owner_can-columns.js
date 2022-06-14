'use strict';

async function updateDependantColumns(queryInterface, Sequelize, columnsUpdateFn) {
  const result = await queryInterface.sequelize.query(
    'SELECT pg_get_viewdef(\'view_collections\') as view', 
    { plain: true });

  const viewCollectionsDefinition = result?.view;

  if (!viewCollectionsDefinition) {
    throw new Error('Could not get view_collections definition')
  }

  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.sequelize.query('DROP VIEW view_collections;', { transaction });

    await columnsUpdateFn(queryInterface, Sequelize, transaction);

    await queryInterface.sequelize.query(`CREATE OR REPLACE VIEW public.view_collections AS ${viewCollectionsDefinition}`, { transaction });

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

module.exports = {
  async up (queryInterface, Sequelize) {
    return updateDependantColumns(queryInterface, Sequelize, async (qI, Seq, transaction ) => {
      await qI.changeColumn('collections', 'owner_can_transfer', 
      {
        type: Seq.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }, 
      { transaction });

      await qI.changeColumn('collections', 'owner_can_destroy',
      {
        type: Seq.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }, 
      { transaction });
    });
  },

  async down (queryInterface, Sequelize) {
    return updateDependantColumns(queryInterface, Sequelize, async (qI, Seq, transaction ) => {
      await qI.changeColumn('collections', 'owner_can_transfer', 
      {
        type: Seq.DataTypes.BOOLEAN,
        allowNull: true,
      }, 
      { transaction });

      await qI.changeColumn('collections', 'owner_can_destroy', 
      {
        type: Seq.DataTypes.BOOLEAN,
        allowNull: true,
      }, 
      { transaction });
    });
  }
};
