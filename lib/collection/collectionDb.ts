/* eslint-disable @typescript-eslint/naming-convention */
import { ICollectionSchemaInfo } from 'crawlers/crawlers.interfaces';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { getProtoBufRoot } from '../../utils/protobuf';
import { stringifyFields } from '../../utils/utils';
import { ICollectionDbEntity } from './collectionDbEntity.interface';

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

function prepareQueryReplacements(collection: ICollectionDbEntity) {
  const { date_of_creation } = collection;

  return {
    ...collection,
    ...stringifyFields(collection, [
      'const_chain_schema',
      'variable_on_chain_schema',
    ]),
    date_of_creation: date_of_creation || null,
  };
}

function createQueryOptions(collection: ICollectionDbEntity, type: QueryTypes) {
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
  collection: ICollectionDbEntity,
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

/**
 * Returns array of parsed collections schema info.
 */
export async function getCollectionsSchemaInfo({ collectionId = null, sequelize })
  : Promise<ICollectionSchemaInfo[]> {
  const collections = await get({
    collectionId,
    selectList: ['collection_id', 'const_chain_schema'],
    sequelize,
  });

  return collections.map((collection) => ({
    collectionId: Number(collection.collection_id),
    schema: getProtoBufRoot(collection.const_chain_schema),
  }));
}
