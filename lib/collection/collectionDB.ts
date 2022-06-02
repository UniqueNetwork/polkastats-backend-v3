/* eslint-disable @typescript-eslint/naming-convention */
import pino from 'pino';

import { QueryTypes, Sequelize, Transaction } from 'sequelize';

import { IPFS_URL } from '../../config/config';
import { SchemaVersion } from '../../constants';
import { normalizeSubstrateAddress, stringifyFields } from '../../utils/utils';
import { ICollectionDB } from './collectionDB.interface';

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

/**
 * Creates 'collection_cover' field value from other fields.
 */
function getCollectionCoverReplacement(collection: ICollectionDB) {
  const result = { collection_cover: null };

  // todo: А где в новых коллекциях брать значения?
  const { schema_version, offchain_schema, variable_on_chain_schema } = collection;

  try {
    const urlPattern = /^http(s)?:\/\/.+/;

    if (schema_version === SchemaVersion.IMAGE_URL && urlPattern.test(offchain_schema)) {
      result.collection_cover = String(offchain_schema).replace('{id}', '1');
    } else if (variable_on_chain_schema) {
      const { collectionCover } = variable_on_chain_schema;
      if (collectionCover) {
        result.collection_cover = `${IPFS_URL}${collectionCover}`;
      }
    }
  } catch (error) {
    logger.error({
      error,
      schema_version,
      offchain_schema,
      variable_on_chain_schema,
    }, 'Collection cover processing error');
  }

  return result;
}

function prepareQueryReplacements(collection: ICollectionDB) {
  const { owner, date_of_creation } = collection;

  return {
    ...collection,
    ...stringifyFields(collection, [
      'const_chain_schema',
      'variable_on_chain_schema',
    ]),
    owner_normalized: normalizeSubstrateAddress(owner),
    date_of_creation: date_of_creation || null,
    ...getCollectionCoverReplacement(collection),
  };
}

function createQueryOptions(collection: ICollectionDB, type: QueryTypes) {
  return {
    type,
    logging: false,
    replacements: {
      ...prepareQueryReplacements(collection),
    },
  };
}

export function get({ collectionId = null, selectList = COLLECTION_FIELDS, sequelize }) {
  let qWhere = '';

  const qOptions = {
    type: QueryTypes.SELECT,
    plain: false,
    logging: false,
    replacements: {},
  };

  if (collectionId) {
    qOptions.plain = true;
    qOptions.replacements = { collectionId };

    qWhere = 'WHERE collection_id = :collectionId';
  }

  return sequelize.query(`SELECT ${selectList.join(',')} FROM collections ${qWhere}`, qOptions);
}

export async function save({
  collection,
  sequelize,
  transaction = null,
  excludeFields = [],
}: {
  collection: ICollectionDB,
  sequelize: Sequelize,
  transaction?: Transaction | null,
  excludeFields?: string[]
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

export function del({ collectionId, sequelize, transaction = null }) {
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
