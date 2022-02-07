'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {      
      await queryInterface.sequelize.query(`
      --beginsql
      update collections c
    set date_of_creation = event.timestamp
    from (select b.timestamp, events.collection_id from block b
inner join (
    select (e.data::json -> 0)::text::int as collection_id, e.block_number
    from event e
    where e.method = 'CollectionCreated'    
) as events on b.block_number = events.block_number) as event
where c.collection_id = event.collection_id;
      --endsql
      `, transaction);
      

      await queryInterface.sequelize.query('DROP VIEW view_collections;', transaction);
      await queryInterface.sequelize.query(`
      create or replace view public.view_collections
      as select
      c.collection_id,
      c.owner,
      c.name,
      c.description,
      c.offchain_schema,
      c.token_limit,
      c.token_prefix,
      c.variable_on_chain_schema::json ->> 'collectionCover'::text AS collection_cover,
      c."mode" as "type",
        c.mint_mode,
        c.limits_accout_ownership,
        c.limits_sponsore_data_size,
        c.limits_sponsore_data_rate,
        c.owner_can_trasfer,
        c.owner_can_destroy,
        c.schema_version,
        c.sponsorship_confirmed,
        c.const_chain_schema,
        (case when coalesce(cs.tokens_count, 0) > 0 then coalesce(cs.tokens_count, 0)
          else 0
        end) as tokens_count,
      (case when coalesce(cs.holders_count, 0) > 0 then  coalesce(cs.holders_count, 0)
          else 0
      end) as holders_count,
     (case when coalesce(cs.actions_count, 0) > 0 then  coalesce(cs.actions_count, 0)
          else 0
      end) as actions_count,
      c.date_of_creation
      from collections c
      left join collections_stats cs on cs.collection_id = c.collection_id;
      `);      

      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {      
      await queryInterface.sequelize.query('DROP VIEW view_collections;', transaction);
      await queryInterface.sequelize.query(`
      create or replace view public.view_collections
      as select
      c.collection_id,
      c.owner,
      c.name,
      c.description,
      c.offchain_schema,
      c.token_limit,
      c.token_prefix,
      c.variable_on_chain_schema::json ->> 'collectionCover'::text AS collection_cover,
      c."mode" as "type",
        c.mint_mode,
        c.limits_accout_ownership,
        c.limits_sponsore_data_size,
        c.limits_sponsore_data_rate,
        c.owner_can_trasfer,
        c.owner_can_destroy,
        c.schema_version,
        c.sponsorship_confirmed,
        c.const_chain_schema,
        (case when coalesce(cs.tokens_count, 0) > 0 then coalesce(cs.tokens_count, 0)
          else 0
        end) as tokens_count,
      (case when coalesce(cs.holders_count, 0) > 0 then  coalesce(cs.holders_count, 0)
          else 0
      end) as holders_count,
     (case when coalesce(cs.actions_count, 0) > 0 then  coalesce(cs.actions_count, 0)
          else 0
      end) as actions_count
      from collections c
      left join collections_stats cs on cs.collection_id = c.collection_id;
      `);

      await transaction.commit();
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      throw err;
    }
  },
};
