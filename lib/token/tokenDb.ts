/* eslint-disable @typescript-eslint/naming-convention */
import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { normalizeSubstrateAddress, stringifyFields } from '../../utils/utils';
import { ITokenDbEntity } from './tokenDbEntity.interface';

const TOKEN_FIELDS = [
  'token_id',
  'collection_id',
  'owner',
  'owner_normalized',
  'data',
  'date_of_creation',
  'parent_id',
];

const NESTING_ADDRESS_PREFIX = '0xf8238ccfff8ed887463fd5e0';

function isNestingAddress(address: string): boolean {
  return address.indexOf(NESTING_ADDRESS_PREFIX) === 0 && address.length === 42;
}

function getTokenIdFromNestingAddress(address: string): number | null {
  if (!isNestingAddress(address)) return null;

  const tokenString = address.slice(
    NESTING_ADDRESS_PREFIX.length + 8,
    NESTING_ADDRESS_PREFIX.length + 25,
  );

  return parseInt(tokenString, 16);
}

function prepareQueryReplacements(token: ITokenDbEntity) {
  const { owner, date_of_creation } = token;
  let parent_id: null | number = null;

  if (isNestingAddress(owner)) {
    parent_id = getTokenIdFromNestingAddress(owner);
  }

  return {
    ...token,
    ...stringifyFields(token, ['data']),
    owner_normalized: normalizeSubstrateAddress(owner),
    date_of_creation: date_of_creation || null,
    parent_id,
  };
}

export async function get({
  collectionId,
  tokenId,
  sequelize,
  selectList = ['owner', 'data'],
}: {
  collectionId: number;
  tokenId: number;
  sequelize: Sequelize;
  selectList?: string[];
}): Promise<Object | null> {
  let qWhere = 'collection_id = :collectionId ';

  const qOptions = {
    type: QueryTypes.SELECT,
    plain: false,
    logging: false,
    replacements: {
      tokenId,
      collectionId,
    },
  };

  if (tokenId) {
    qWhere = `${qWhere} AND token_id = :tokenId`;
    qOptions.plain = true;
  }

  return sequelize.query(
    `SELECT ${selectList.join(',')} FROM tokens WHERE ${qWhere}`,
    qOptions,
  );
}

export async function save({
  token,
  sequelize,
  transaction = null,
  excludeFields = [],
}: {
  token: ITokenDbEntity;
  sequelize: Sequelize;
  transaction?: Transaction;
  excludeFields?: string[];
}) {
  const fields = TOKEN_FIELDS;
  const queryFields = fields.filter((field) => !excludeFields.includes(field));
  const updateFields = queryFields
    .map((item) => `${item} = :${item}`)
    .join(',');
  const values = queryFields.map((item) => `:${item}`).join(',');
  await sequelize.query(
    `
      INSERT INTO tokens (${queryFields.join(',')}) VALUES(${values})
      ON CONFLICT ON CONSTRAINT tokens_pkey
      DO UPDATE SET ${updateFields};
    `,
    {
      type: QueryTypes.INSERT,
      logging: false,
      replacements: {
        ...prepareQueryReplacements(token),
      },
      transaction,
    },
  );
}

export async function del({
  tokenId,
  collectionId,
  sequelize,
  transaction = null,
}: {
  tokenId: number;
  collectionId: number;
  sequelize: Sequelize;
  transaction?: Transaction;
}) {
  await sequelize.query(
    'DELETE FROM tokens WHERE token_id =:tokenId and collection_id = :collectionId',
    {
      type: QueryTypes.DELETE,
      replacements: {
        tokenId,
        collectionId,
      },
      transaction,
    },
  );
}
