const pino = require('pino');

const { QueryTypes } = require('sequelize');
const { IPFS_URL } = require('../config/config');
const { SchemaVersion } = require('../constants');
const { normalizeSubstrateAddress } = require('../utils/utils');

const logger = pino({ name: 'CollectionDB', level: process.env.PINO_LOG_LEVEL || 'info' });

const COLLECTION_FIELDS = [
  'collection_id',
  'name',
  'description',
  'owner',
  'owner_normalized',
  'token_limit',
  'offchain_schema',
  'const_chain_schema',
  'variable_on_chain_schema',
  'limits_account_ownership',
  'limits_sponsore_data_size',
  'limits_sponsore_data_rate',
  'owner_can_transfer',
  'owner_can_destroy',
  'sponsorship',
  'schema_version',
  'token_prefix',
  'mode',
  'mint_mode',
  'date_of_creation',
  'collection_cover',
];

function get({ collectionId = null, selectList = COLLECTION_FIELDS, sequelize }) {
  let qWhere = '';

  const qOptions = {
    type: QueryTypes.SELECT,
    plain: false,
    logging: false,
  };

  if (collectionId) {
    qOptions.plain = true;
    qOptions.replacements = { collectionId };

    qWhere = 'WHERE collection_id = :collectionId';
  }

  return sequelize.query(`SELECT ${selectList.join(',')} FROM collections ${qWhere}`, qOptions);
}

function getLimitsReplacements(collection) {
  const result = {};
  result.token_limit = collection.tokenLimit;
  result.limits_account_ownership = collection.limitsAccountOwnership;
  result.limits_sponsore_data_size = collection.limitsSponsoreDataSize;
  result.limits_sponsore_data_rate = collection.limitsSponsoreDataRate;
  result.owner_can_transfer = collection.ownerCanTransfer;
  result.owner_can_destroy = collection.ownerCanDestroy;
  return result;
}

function getSchemaReplacements(collection) {
  const result = {};
  result.offchain_schema = collection.offchainSchema;
  result.const_chain_schema = collection.constChainSchema;
  result.variable_on_chain_schema = collection.variableOnChainSchema;
  result.schema_version = collection.schemaVersion;
  return result;
}

/**
 * Creates 'collection_cover' field value from other fields.
 */
function getCollectionCoverReplacement(collection) {
  const result = { collection_cover: null };

  const { schemaVersion, offchainSchema, variableOnChainSchema } = collection;

  try {
    const urlPattern = /^http(s)?:\/\/.+/;

    if (schemaVersion === SchemaVersion.IMAGE_URL && urlPattern.test(offchainSchema)) {
      result.collection_cover = String(offchainSchema).replace('{id}', '1');
    } else if (variableOnChainSchema) {
      const parsedValue = JSON.parse(variableOnChainSchema);

      const { collectionCover } = parsedValue;
      if (collectionCover) {
        result.collection_cover = `${IPFS_URL}${collectionCover}`;
      }
    }
  } catch (error) {
    logger.error({
      error,
      schemaVersion,
      offchainSchema,
      variableOnChainSchema,
    }, 'Collection cover processing error');
  }

  return result;
}

function prepareQueryReplacements(collection) {
  const result = {};

  result.collection_id = collection.collection_id;
  result.owner = collection.owner;
  result.owner_normalized = normalizeSubstrateAddress(collection.owner);
  result.name = collection.name;
  result.description = collection.description;
  result.sponsorship = collection.sponsorship;
  result.token_prefix = collection.tokenPrefix;
  result.mode = collection.mode;
  result.mint_mode = collection.mint_mode;
  result.date_of_creation = collection.date_of_creation || null;

  return Object.assign(
    result,
    getLimitsReplacements(collection),
    getSchemaReplacements(collection),
    getCollectionCoverReplacement(collection),
  );
}

function createQueryOptions(collection, type) {
  const result = {};

  result.type = type;
  result.logging = false;
  result.replacements = {
    ...prepareQueryReplacements(collection),
  };
  return result;
}

async function add({
  collection,
  sequelize,
  insertList = COLLECTION_FIELDS,
}) {
  const values = insertList.map((item) => `:${item}`).join(',');

  await sequelize.query(`INSERT INTO collections (${insertList.join(',')}) VALUES (${values})`, {
    ...createQueryOptions(collection, QueryTypes.INSERT),
  });
}

function del({ collectionId, sequelize, transaction = null }) {
  return Promise.all([
    'DELETE FROM tokens WHERE collection_id = :collectionId',
    'DELETE FROM collections WHERE collection_id = :collectionId',
  ].map((query) => sequelize.query(query, {
    type: QueryTypes.DELETE,
    logging: false,
    transaction,
    replacements: {
      collectionId,
    },
  })));
}

async function save({
  collection,
  sequelize,
  transaction = null,
  excludeFields = [],
}) {
  const fields = COLLECTION_FIELDS;
  const queryFields = fields.filter((field) => !excludeFields.includes(field));
  const updateFields = queryFields.map((item) => `${item} = :${item}`).join(',');
  const values = queryFields.map((item) => `:${item}`).join(',');
  const query = `
    INSERT INTO collections (${queryFields.join(',')}) VALUES (${values})
    ON CONFLICT ON CONSTRAINT collections_pkey
    DO UPDATE SET ${updateFields};
  `;
  await sequelize.query(
    query,
    {
      ...createQueryOptions(collection, QueryTypes.UPDATE),
      transaction,
    },
  );
}

module.exports = Object.freeze({
  get,
  add,
  del,
  save,
});
