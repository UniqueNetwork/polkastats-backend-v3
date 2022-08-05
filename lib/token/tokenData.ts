/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { UpDataStructsTokenData } from '@unique-nft/unique-mainnet-types';
import { ICollectionSchemaInfo } from 'crawlers/crawlers.interfaces';
import { TokenPropertiesResult, UniqueTokenDecoded } from '@unique-nft/sdk/tokens';
import {
  normalizeSubstrateAddress,
  sanitizePropertiesValues
} from '../../utils/utils';
import protobuf from '../../utils/protobuf';
import { ITokenDbEntity } from './tokenDbEntity.interface';
import { OpalAPI } from '../providerAPI/bridgeProviderAPI/concreate/opalAPI';

function parseConstDataValue(constData, schema) {
  const buffer = Buffer.from(constData.replace('0x', ''), 'hex');
  if (buffer.toString().length !== 0 && constData.replace('0x', '') && schema !== null) {
    return {
      constData,
      buffer,
      locale: 'en',
      root: schema,
    };
  }

  return { constData };
}

function getDeserializeConstData(statement) {
  let result: { hex?: string } = {};
  if ('buffer' in statement) {
    try {
      result = { ...protobuf.deserializeNFT(statement) };
    } catch (error) {
      // todo: Useless log now. Should log error by logger with collectionId and tokenId.
      // eslint-disable-next-line no-console
      console.error(
        'getDeserializeConstData(): Could not process constData with existing schema.',
        // statement,
        `Error message: '${error?.message}'`,
      );
      result.hex = statement.constData?.toString().replace('0x', '') || statement.constData;
    }
  } else {
    result.hex = statement.constData?.toString().replace('0x', '') || statement.constData;
  }

  return result;
}

function processConstData(constData, schema) {
  if (!constData) {
    return {};
  }

  const statement = parseConstDataValue(constData, schema);
  return getDeserializeConstData(statement);
}

function processOldProperties(schema: any, rawToken: UpDataStructsTokenData)
  : { data: Object } {
  const rawProperties = rawToken.properties;

  let oldConstData: Object | string | null = null;

  rawProperties.forEach(({ key, value }) => {
    const strKey = key.toUtf8();
    const strValue = value.toUtf8();
    let processedValue = null;

    if (['_old_constData'].includes(strKey)) {
      try { processedValue = value.toHex(); } catch (err) { /* */ }

      oldConstData = processedValue || strValue;
    }
  });

  return {
    data: processConstData(oldConstData, schema),
  };
}

function formatTokenData({
  rawToken,
  tokenDecoded,
  tokenProperties,
  collectionInfo
}: {
  rawToken: UpDataStructsTokenData,
  tokenDecoded: UniqueTokenDecoded,
  tokenProperties: TokenPropertiesResult,
  collectionInfo: ICollectionSchemaInfo
}) : ITokenDbEntity {
  const { schema } = collectionInfo;

  const {
    tokenId: token_id,
    collectionId: collection_id,
    attributes,
    nestingParentToken,
  } = tokenDecoded;

  const {
    owner: rawOwner,
  }: { owner: { Ethereum?: string; Substrate?: string } } = tokenDecoded;

  const owner = rawOwner?.Ethereum || rawOwner?.Substrate;

  let parentId = null;
  if (nestingParentToken) {
    const { collectionId, tokenId } = nestingParentToken as { collectionId: number; tokenId: number };
    parentId = `${collectionId}_${tokenId}`;
  }

  return {
    token_id,
    collection_id,
    owner,
    owner_normalized: normalizeSubstrateAddress(owner),
    attributes: JSON.stringify(attributes),
    properties: tokenProperties
      ? JSON.stringify(sanitizePropertiesValues(tokenProperties))
      : '[]',
    parent_id: parentId,
    ...processOldProperties(schema, rawToken),
  };
}

export async function getFormattedToken(tokenId: number, collectionInfo: ICollectionSchemaInfo, bridgeAPI: OpalAPI)
  : Promise<ITokenDbEntity | null> {
  const { collectionId } = collectionInfo;
  const { rawToken, tokenDecoded, tokenProperties } = await bridgeAPI.getToken(collectionId, tokenId);

  return tokenDecoded ? formatTokenData({
    rawToken,
    tokenDecoded,
    tokenProperties,
    collectionInfo
  }) : null;
}
