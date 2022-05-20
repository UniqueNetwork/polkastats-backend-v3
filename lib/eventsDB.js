const { QueryTypes } = require('sequelize');
const { EVENT_PHASE, EVENT_SECTION, EVENT_METHOD } = require('../constants');

function upsertEvent(event, sequelize, transaction) {
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
      replacements: event,
      transaction,
    },
  );
}

// todo: переименовать, описать
async function fillBlocksTransactions(event, sequelize, transaction) {
  const {
    phase,
    section,
    method, amount: eventAmount,
  } = event;

  if (phase === EVENT_PHASE.INITIALIZATION
      || section !== EVENT_SECTION.BALANCES
      || ![EVENT_METHOD.DEPOSIT, EVENT_METHOD.TRANSFER].includes(method)) {
    return;
  }

  // Check if record already exists
  const { block_index: blockIndex, block_number: blockNumber } = event;
  const existingRow = await sequelize.query('SELECT * FROM block_transactions WHERE block_index=:blockIndex AND block_number=:blockNumber;', {
    type: QueryTypes.SELECT,
    logging: false,
    replacements: {
      blockIndex,
      blockNumber,
    },
  });

  const amountFloat = parseFloat(eventAmount);
  const amount = method === EVENT_METHOD.TRANSFER ? amountFloat : 0;
  const fee = method === EVENT_METHOD.DEPOSIT ? amountFloat : 0;

  if (existingRow) {
    // Update existing record
    const newAmount = amount > 0 ? (existingRow.amount || 0) + amount : existingRow.amount;
    const newFee = fee > 0 ? (existingRow.fee || 0) + fee : existingRow.fee;

    await sequelize.query(
      'UPDATE block_transactions SET amount=:newAmount, fee=:newFee WHERE block_index=:blockIndex AND block_number=:blockNumber;;',
      {
        logging: false,
        replacements: {
          blockIndex,
          blockNumber,
          newAmount,
          newFee,
        },
        transaction,
      },
    );
  } else {
    // Create new record
    await sequelize.query(
      'INSERT INTO block_transactions (block_index, block_number, amount, fee) VALUES (:blockIndex, :blockNumber, :amount, :fee);',
      {
        logging: false,
        replacements: {
          blockIndex,
          blockNumber,
          amount,
          fee,
        },
        transaction,
      },
    );
  }
}

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
  return Promise.all([
    upsertEvent(event, sequelize, transaction),
    fillBlocksTransactions(event, sequelize, transaction),
  ]);
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
