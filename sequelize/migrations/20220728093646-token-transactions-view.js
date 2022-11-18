'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(
      `
      CREATE OR REPLACE VIEW public.view_token_transactions AS 
      WITH transfer_events AS (
        SELECT
            timestamp,    
            block_number,
            block_index, 
            (phase::jsonb->>'applyExtrinsic')::int AS extrinsic_index,
            (data::jsonb->>0)::int AS collection_id,
            (data::jsonb->>1)::int AS token_id
        FROM event 
        WHERE section='common' AND method='Transfer'
        ORDER BY timestamp DESC
      )
      SELECT 
          ev.block_index,
          ev.timestamp,
          ev.collection_id,
          ev.token_id,
          
          ex.signer,
          ex.signer_normalized,
          ex.to_owner,
          ex.to_owner_normalized,
          
          c.name AS collection_name,
          c.token_prefix AS token_prefix,
          
          t.data->>'name' AS token_name,
      
          COALESCE(
              t.data::json ->> 'ipfsJson'::text,
              replace(
                COALESCE(c.offchain_schema, ''::text),
                '{id}'::text,
                ev.token_id::character varying(255)::text
              ),
              ''::text
            ) AS image_path
      FROM transfer_events AS ev
      
      INNER JOIN extrinsic AS ex ON 
          ev.block_number = ex.block_number
          AND ev.extrinsic_index = ex.extrinsic_index
          AND ex.method = 'transfer'
          
      INNER JOIN collections AS c ON
          ev.collection_id = c.collection_id
          
      INNER JOIN tokens AS t ON
          ev.collection_id = t.collection_id
          AND ev.token_id = t.token_id;SELECT t.token_id,
            t.collection_id,
            t.data,
            t.owner,
            t.owner_normalized,
            t.owner != c.owner AS is_sold,
            COALESCE(t.data::json ->> 'ipfsJson'::text, replace(COALESCE(c.offchain_schema, ''::text), '{id}'::text, t.token_id::character varying(255)::text), ''::text) AS image_path,
            c.token_prefix,
            c.name AS collection_name,
            c.description AS collection_description,
            c.variable_on_chain_schema::json ->> 'collectionCover'::text AS collection_cover,
            c.owner AS collection_owner,
            c.owner_normalized AS collection_owner_normalized,
            t.date_of_creation
          FROM tokens t
            LEFT JOIN collections c ON c.collection_id = t.collection_id;`
    );
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.query('DROP VIEW view_token_transactions;');
  }
};
