const { QueryTypes } = require('sequelize');

function get({
  blockNumber, index, sequelize,
}) {
  const query = 'SELECT FROM event WHERE block_number = :blockNumber AND event_index = :index';
  return sequelize.query(query, {
    type: QueryTypes.SELECT,
    logging: false,
    plain: true,
    replacements: {
      blockNumber,
      index,
    },
  });
}

async function save({
  event,
  sequelize,
  transaction = null,
}) {
  const fields = [
    'block_number',
    'event_index',
    'section',
    'method',
    'phase',
    'data',
    'amount',
    'block_index',
    'timestamp',
  ];

  const values = fields.map((item) => `:${item}`).join(',');
  const updateFields = fields.map((item) => `${item} = :${item}`).join(',');

  return sequelize.query(
    `INSERT INTO event(${fields.join(',')}) VALUES (${values})
    ON CONFLICT ON CONSTRAINT event_pkey
    DO UPDATE SET ${updateFields};`,
    {
      type: QueryTypes.INSERT,
      logging: false,
      replacements: {
        ...event,
        block_number: event.blockNumber,
        block_index: event.blockIndex,
        event_index: event.eventIndex,
      },
      transaction,
    },
  );
}

// eventType = ItemCreated | ItemDestroyed
function getTokenEvent(sequelize, collectionId, tokenId, eventType) {
  const query = `
    select block_number, event_index, method from event
    where method = :eventType and (data::json->>0)::bigint = :collectionId and (data::json->>1)::bigint = :tokenId
  `;
  return sequelize.query(
    query,
    {
      type: QueryTypes.SELECT,
      logging: false,
      plain: true,
      replacements: {
        collectionId,
        tokenId,
        eventType,
      },
    },
  );
}

// eventType = CollectionCreated | CollectionDestroyed
function getCollectionEvent(sequelize, collectionId, eventType) {
  const query = `
    select block_number, event_index, method from event
    where method = :eventType and (data::json->>0)::bigint = :collectionId
  `;
  return sequelize.query(
    query,
    {
      type: QueryTypes.SELECT,
      logging: false,
      plain: true,
      replacements: {
        collectionId,
        eventType,
      },
    },
  );
}

module.exports = Object.freeze({
  get,
  save,
  getTokenEvent,
  getCollectionEvent,
});
