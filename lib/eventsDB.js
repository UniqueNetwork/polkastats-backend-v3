const { EVENT_PHASE, EVENT_SECTION, EVENT_METHOD } = require('../constants');
const { QueryTypes } = require('sequelize');

async function get({
  blockNumber, index, sequelize
}) {
  const query = `SELECT FROM event WHERE block_number = :blockNumber AND event_index = :index`;
  return await sequelize.query(query, {
    type: QueryTypes.SELECT,
    logging: false,
    plain: true,
    replacements: {
      blockNumber,
      index
    }
  });
}

async function save({
  event,
  fields = [
    'block_number',
    'event_index',
    'section',
    'method',
    'phase',
    'data',
    'amount',
    'block_index',
    'timestamp',
  ],
  sequelize,
  transaction = null,
}) {
  const values = fields.map(item => `:${item}`).join(',');
  const updateFields = fields.map((item) => `${item} = :${item}`).join(',');

  // console.log('NEW EVENT', event.section, event.amount)

  return Promise.all([
    sequelize.query(
    `
    INSERT INTO event(${fields.join(',')}) VALUES (${values})
    ON CONFLICT ON CONSTRAINT event_pkey
    DO UPDATE SET ${updateFields};
    `,
    {
      type: QueryTypes.INSERT,
      logging: false,
      replacements: event,
      transaction,
    }),
    fillBlocksTransactions(event)
  ]);

  
}

async function fillBlocksTransactions(event) {
  const { phase, section, method, amount: eventAmount } = event;

  if (phase === EVENT_PHASE.INITIALIZATION || section !== EVENT_SECTION.BALANCES) {
    return;
  }

  const amountFloat = parseFloat(eventAmount);

  const amount = method === EVENT_METHOD.TRANSFER ? amountFloat : null;
  const fee = method === EVENT_METHOD.DEPOSIT ? amountFloat : null;

  console.log('FILL BLOCK TRANSACTIONS', eventAmount, method, amount, fee);
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
})