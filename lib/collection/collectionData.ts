/* eslint-disable no-underscore-dangle */
import { Option } from '@polkadot/types';
import {
  UpDataStructsRpcCollection,
  UpDataStructsSponsoringRateLimit,
} from '@unique-nft/types';
import { avoidUseBuffer } from '../../utils/utils';
import { OpalAPI } from '../providerAPI/bridgeProviderAPI/concreate/opalAPI';
import {
  ICollectionDB,
  ICollectionDBFieldsLimit,
  ICollectionDBFieldsSchema,
} from './collection';

function processSponsorship(collection: UpDataStructsRpcCollection): { sponsorship: string | null } {
  const { sponsorship } = collection;
  return {
    sponsorship: sponsorship.isDisabled
      ? null
      : JSON.stringify(sponsorship),
  };
}

function getSponsoredRateLimit(sponsoringRateLimits: Option<UpDataStructsSponsoringRateLimit>): number {
  if (sponsoringRateLimits.isEmpty || sponsoringRateLimits.value.isSponsoringDisabled) {
    return -1;
  }

  if (Number.isInteger(sponsoringRateLimits.value.asBlocks)) {
    return Number(sponsoringRateLimits.value.asBlocks);
  }

  return null;
}

function processLimits(collection: UpDataStructsRpcCollection): ICollectionDBFieldsLimit {
  const { limits } = collection;
  return {
    token_limit: Number(limits.tokenLimit) || 0,
    limits_account_ownership: Number(limits.accountTokenOwnershipLimit) || 0,
    limits_sponsore_data_size: Number(limits.sponsoredDataSize),
    limits_sponsore_data_rate: getSponsoredRateLimit(limits.sponsoredDataRateLimit),
    owner_can_transfer: !!limits.ownerCanTransfer.isTrue,
    owner_can_destroy: !!limits.ownerCanDestroy.isTrue,
  };
}

function processProperties(collection: UpDataStructsRpcCollection)
  : ICollectionDBFieldsSchema & { properties: Object } {
  const { properties: rawProperties } = collection;

  const properties : {
    _old_offchainSchema?: string,
    _old_constOnChainSchema?: Object,
    _old_variableOnChainSchema?: Object,
    _old_schemaVersion?: string
  } = {};

  rawProperties.forEach(({ key, value }) => {
    const strKey = key.toUtf8();
    const strValue = value.toUtf8();
    let jsonValue = null;

    if (strValue && ['_old_constOnChainSchema', '_old_variableOnChainSchema'].includes(strKey)) {
      try {
        jsonValue = JSON.parse(strValue);
      } catch (err) {
        //
      }
    }
    properties[strKey] = jsonValue || strValue;
  });

  return {
    offchain_schema: properties._old_offchainSchema || null,
    const_chain_schema: properties._old_constOnChainSchema || null,
    variable_on_chain_schema: properties._old_variableOnChainSchema || null,
    schema_version: properties._old_schemaVersion || null,
    properties,
  };
}

function processPermissions(collection: UpDataStructsRpcCollection): { mint_mode: boolean, permissions: Object } {
  const { permissions: rawPermissions } = collection;
  const permissions = rawPermissions.toJSON();

  return {
    mint_mode: !!permissions.mintMode,
    permissions,
  };
}

function processTokenPropertyPermissions(collection: UpDataStructsRpcCollection)
  : { token_property_permissions: Object } {
  const { tokenPropertyPermissions: rawTokenPropertyPermissions } = collection;

  const tokenPropertyPermissions = {};

  rawTokenPropertyPermissions.forEach(({ key, permission }) => {
    const strKey = key.toUtf8();
    const jsonPermission = permission.toJSON();
    tokenPropertyPermissions[strKey] = jsonPermission;
  });

  return {
    token_property_permissions: tokenPropertyPermissions,
  };
}

function getCollectionDbData(collectionId: number, collection: UpDataStructsRpcCollection): ICollectionDB {
  console.log('getCollectionDbData', collectionId, collection.toJSON());

  return {
    collection_id: collectionId,
    owner: collection.owner.toString(),
    name: avoidUseBuffer(collection.name),
    description: avoidUseBuffer(collection.description),
    token_prefix: collection.tokenPrefix.toUtf8(),
    mode: JSON.stringify(collection.mode),
    ...processSponsorship(collection),
    ...processLimits(collection),
    ...processProperties(collection),
    ...processPermissions(collection),
    ...processTokenPropertyPermissions(collection),
  };
}

// eslint-disable-next-line import/prefer-default-export
export async function getCollectionById(collectionId, bridgeAPI: OpalAPI): Promise<ICollectionDB | null> {
  const rawCollection = await bridgeAPI.getCollection(collectionId);

  if (rawCollection) {
    return getCollectionDbData(collectionId, rawCollection);
  }

  return null;
}
