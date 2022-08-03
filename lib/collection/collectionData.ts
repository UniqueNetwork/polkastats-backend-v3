/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import pino from 'pino';
import {
  UpDataStructsCollectionLimits,
  UpDataStructsRpcCollection,
} from '@unique-nft/unique-mainnet-types';
import { CollectionInfoWithSchema } from '@unique-nft/sdk/tokens';
import { SchemaVersion } from '../../constants';
import { avoidUseBuffer, normalizeSubstrateAddress } from '../../utils/utils';
import { OpalAPI } from '../providerAPI/bridgeProviderAPI/concreate/opalAPI';
import {
  ICollectionDbEntity,
  ICollectionDbEntityFieldsetLimits,
  ICollectionDbEntityFieldsetSchema,
} from './collectionDbEntity.interface';

const logger = pino({ name: 'CollectionData', level: process.env.PINO_LOG_LEVEL || 'info' });

type SponsoringRateLimits = { blocks?: number, sponsoringDisabled?: boolean | null };

function getSponsoredDataRate(sponsoringRateLimits: SponsoringRateLimits): number {
  if (!Number.isNaN(Number(sponsoringRateLimits.blocks))) {
    return Number(sponsoringRateLimits.blocks);
  }

  // The fact of existence of sponsoringDisabled property seems to mean that sponsoring is disabled
  if (sponsoringRateLimits.sponsoringDisabled !== undefined) {
    return -1;
  }

  return null;
}

/**
 * Processes raw 'limits' field value.
 */
function processLimits(rawEffectiveCollectionLimits: UpDataStructsCollectionLimits): ICollectionDbEntityFieldsetLimits {
  const effectiveLimits = rawEffectiveCollectionLimits.toJSON();

  return {
    token_limit: Number(effectiveLimits.tokenLimit) || 0,
    limits_account_ownership: Number(effectiveLimits.accountTokenOwnershipLimit) || 0,
    limits_sponsore_data_size: Number(effectiveLimits.sponsoredDataSize),
    limits_sponsore_data_rate: getSponsoredDataRate(effectiveLimits.sponsoredDataRateLimit as SponsoringRateLimits),
    owner_can_transfer: Boolean(effectiveLimits.ownerCanTransfer),
    owner_can_destroy: Boolean(effectiveLimits.ownerCanDestroy),
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

    if (strValue && [
      '_old_constOnChainSchema',
      '_old_variableOnChainSchema',
      'coverPicture.ipfsCid'
    ].includes(strKey)) {
      try { processedValue = JSON.parse(strValue); } catch (err) { /* */ }
    }
    properties[strKey] = processedValue || strValue;
  });

  if (properties['coverPicture.ipfsCid']) {
    const collectionCover = properties['coverPicture.ipfsCid'];
    properties._old_variableOnChainSchema = typeof properties._old_variableOnChainSchema === 'object'
      ? { ...(properties._old_variableOnChainSchema), collectionCover }
      : { collectionCover };
  }

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
function formatCollectionData(
  {
    collectionId,
    rawCollection,
    collectionSdk,
    rawEffectiveCollectionLimits
  } :
  { collectionId: number,
    rawCollection: UpDataStructsRpcCollection,
    collectionSdk: CollectionInfoWithSchema,
    rawEffectiveCollectionLimits: UpDataStructsCollectionLimits
  }
): ICollectionDbEntity {
  const owner = rawCollection.owner.toString();
  const processedProperties = processProperties(rawCollection);

  const { properties, schema: { attributesSchema = null } = {} } = collectionSdk;

  console.log(properties, attributesSchema);

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
    ...processLimits(rawEffectiveCollectionLimits),
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
  const { collection, effectiveCollectionLimits, collectionSdk } = await bridgeAPI.getCollection(collectionId);

  return collection ? formatCollectionData({
    collectionId,
    collection,
    collectionSdk,
    effectiveCollectionLimits
  }) : null;
}
