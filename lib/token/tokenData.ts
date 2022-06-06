/* eslint-disable no-underscore-dangle */
import { ICollectionSchemaInfo } from 'crawlers/crawlers.interfaces';
import { UpDataStructsTokenData } from '@unique-nft/types';
import { normalizeSubstrateAddress } from '../../utils/utils';
import protobuf from '../../utils/protobuf';
import { ITokenDB } from './tokenDB.interface';
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

function processProperties(schema: any, rawToken: UpDataStructsTokenData)
  : { data: Object, properties: Object } {
  const rawProperties = rawToken.properties;

  const properties : {
    _old_constData?: Object | string,
  } = {};

  rawProperties.forEach(({ key, value }) => {
    const strKey = key.toUtf8();
    const strValue = value.toUtf8();
    let processedValue = null;

    if (['_old_constData'].includes(strKey)) {
      try { processedValue = value.toHex(); } catch (err) { /* */ }
    }

    properties[strKey] = processedValue || strValue;
  });

  return {
    data: processConstData(properties._old_constData, schema),
    properties,
  };
}

function formatTokenData(tokenId: number, collectionInfo: ICollectionSchemaInfo, rawToken: UpDataStructsTokenData)
  : ITokenDB {
  const { collectionId, schema } = collectionInfo;

  const rawOwnerJson = rawToken.owner.toJSON() as { substrate?: string, ethereum?: string };

  const owner = rawOwnerJson?.substrate || rawOwnerJson?.ethereum;

  return {
    token_id: tokenId,
    collection_id: collectionId,
    owner,
    owner_normalized: normalizeSubstrateAddress(owner),
    ...processProperties(schema, rawToken),
  };
}

export async function getFormattedToken(tokenId: number, collectionInfo: ICollectionSchemaInfo, bridgeAPI: OpalAPI)
  : Promise<ITokenDB | null> {
  const { collectionId } = collectionInfo;
  const rawToken = await bridgeAPI.getToken(collectionId, tokenId);

  // if (rawToken && rawToken.properties.length) {
  //   console.log('getFormattedToken()', rawToken.toJSON());
  // }

  return rawToken ? formatTokenData(tokenId, collectionInfo, rawToken) : null;
}
