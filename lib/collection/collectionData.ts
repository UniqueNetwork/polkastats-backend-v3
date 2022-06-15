/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import pino from 'pino';
import { Option } from '@polkadot/types';
import {
  UpDataStructsRpcCollection,
  UpDataStructsSponsoringRateLimit,
} from '@unique-nft/types';
import { SchemaVersion } from '../../constants';
import { avoidUseBuffer, normalizeSubstrateAddress } from '../../utils/utils';
import { OpalAPI } from '../providerAPI/bridgeProviderAPI/concreate/opalAPI';
import {
  ICollectionDbEntity,
  ICollectionDbEntityFieldsetLimits,
  ICollectionDbEntityFieldsetSchema,
} from './collectionDbEntity.interface';

const logger = pino({ name: 'CollectionData', level: process.env.PINO_LOG_LEVEL || 'info' });

function getSponsoredDataRate(sponsoringRateLimits: Option<UpDataStructsSponsoringRateLimit>): number {
  if (sponsoringRateLimits.isEmpty || sponsoringRateLimits.value.isSponsoringDisabled) {
    return -1;
  }

  if (Number.isInteger(sponsoringRateLimits.value.asBlocks)) {
    return Number(sponsoringRateLimits.value.asBlocks);
  }

  return null;
}

/**
 * Processes raw 'limits' field value.
 */
function processLimits(collection: UpDataStructsRpcCollection): ICollectionDbEntityFieldsetLimits {
  const { limits: rawLimits } = collection;
  const limits = rawLimits.toHuman();

  return {
    token_limit: Number(limits.tokenLimit) || 0,
    limits_account_ownership: Number(limits.accountTokenOwnershipLimit) || 0,
    limits_sponsore_data_size: Number(limits.sponsoredDataSize),
    limits_sponsore_data_rate: getSponsoredDataRate(rawLimits.sponsoredDataRateLimit),
    owner_can_transfer: !!limits.ownerCanTransfer,
    owner_can_destroy: !!limits.ownerCanDestroy,
  };
}

/**
 * Processes raw 'sponsorship' field value.
 */
function processSponsorship(collection: UpDataStructsRpcCollection): { sponsorship: string | null } {
  const { sponsorship } = collection;
  return {
    sponsorship: sponsorship.isDisabled
      ? null
      : JSON.stringify(sponsorship),
  };
}

/**
 * Processes raw 'properties' field value.
 */
function processProperties(collection: UpDataStructsRpcCollection)
  : ICollectionDbEntityFieldsetSchema & { properties: Object } {
  const { properties: rawProperties } = collection;

  // For now we should have the exact set of '_old_*' properties.
  const properties : {
    _old_offchainSchema?: string,
    _old_constOnChainSchema?: Object,
    _old_variableOnChainSchema?: Object,
    _old_schemaVersion?: string
  } = {};

  rawProperties.forEach(({ key, value }) => {
    const strKey = key.toUtf8();
    const strValue = value.toUtf8();
    let processedValue = null;

    if (strValue && ['_old_constOnChainSchema', '_old_variableOnChainSchema'].includes(strKey)) {
      try { processedValue = JSON.parse(strValue); } catch (err) { /* */ }
    }
    properties[strKey] = processedValue || strValue;
  });

  return {
    offchain_schema: properties._old_offchainSchema || null,
    const_chain_schema: properties._old_constOnChainSchema || null,
    variable_on_chain_schema: properties._old_variableOnChainSchema || null,
    schema_version: properties._old_schemaVersion || null,
    properties,
  };
}

/**
 * Processes raw 'permissions' field value.
 * For now we take only 'mintMode' field value.
 */
function processPermissions(collection: UpDataStructsRpcCollection): { mint_mode: boolean, permissions: Object } {
  const { permissions: rawPermissions } = collection;
  const permissions = rawPermissions.toJSON();

  return {
    // For now we take only 'mintMode' from 'permissions'
    mint_mode: !!permissions.mintMode,
    permissions,
  };
}

/**
 * Converts raw 'tokenPropertyPermissions' field value into simple key:value json.
 */
function processTokenPropertyPermissions(collection: UpDataStructsRpcCollection)
  : { token_property_permissions: Object } {
  const { tokenPropertyPermissions: rawTokenPropertyPermissions } = collection;

  const tokenPropertyPermissions = {};

  rawTokenPropertyPermissions.forEach(({ key, permission }) => {
    const strKey = key.toUtf8();
    tokenPropertyPermissions[strKey] = permission.toJSON();
  });

  return {
    token_property_permissions: tokenPropertyPermissions,
  };
}

/**
 * Creates 'collection_cover' field value from other fields.
 */
function createCollectionCoverValue(schemaFields: ICollectionDbEntityFieldsetSchema) {
  let result = null;

  const { schema_version, offchain_schema, variable_on_chain_schema } = schemaFields;

  try {
    const urlPattern = /^["']?(http[s]?:\/\/[^"']+)["']?$/;

    if (schema_version === SchemaVersion.IMAGE_URL && offchain_schema && urlPattern.test(offchain_schema)) {
      const match = offchain_schema.match(urlPattern);
      const plainUrl = match[1];
      result = String(plainUrl).replace('{id}', '1');
    } else if (variable_on_chain_schema) {
      const { collectionCover } = variable_on_chain_schema;
      if (collectionCover) {
        result = collectionCover;
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

/**
 * Creates collection object in database suitable format
 * from raw collection object retrieved from chain api.
 */
function formatCollectionData(collectionId: number, rawCollection: UpDataStructsRpcCollection): ICollectionDbEntity {
  const owner = rawCollection.owner.toString();
  const processedProperties = processProperties(rawCollection);

  return {
    collection_id: collectionId,
    owner,
    owner_normalized: normalizeSubstrateAddress(owner),
    name: avoidUseBuffer(rawCollection.name),
    description: avoidUseBuffer(rawCollection.description),
    token_prefix: rawCollection.tokenPrefix.toUtf8(),
    mode: JSON.stringify(rawCollection.mode),
    collection_cover: createCollectionCoverValue(processedProperties),
    ...processedProperties,
    ...processLimits(rawCollection),
    ...processSponsorship(rawCollection),
    ...processPermissions(rawCollection),
    ...processTokenPropertyPermissions(rawCollection),
  };
}

/**
 * Requests raw chain collection by collectionId
 * and returns collection object in database model format.
 */
export async function getFormattedCollectionById(collectionId, bridgeAPI: OpalAPI)
  : Promise<ICollectionDbEntity | null> {
  const rawCollection = await bridgeAPI.getCollection(collectionId);

  return rawCollection ? formatCollectionData(collectionId, rawCollection) : null;
}
