/* eslint-disable no-underscore-dangle */
import { ICollectionSchemaInfo } from 'crawlers/crawlers.interfaces';
import { UpDataStructsTokenData } from '@unique-nft/types';
import protobuf from '../../utils/protobuf';
import { ITokenDB } from './tokenDB.interface';
import { OpalAPI } from '../providerAPI/bridgeProviderAPI/concreate/opalAPI';

function parseConstData(constData, schema) {
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
      // eslint-disable-next-line no-console
      console.error(
        'getDeserializeConstData(): Can not process constData with existing schema',
        statement,
      );
      result.hex = statement.constData?.toString().replace('0x', '') || statement.constData;
    }
  } else {
    result.hex = statement.constData?.toString().replace('0x', '') || statement.constData;
  }

  return result;
}

function getConstData(constData, schema) {
  const statement = parseConstData(constData, schema);
  return JSON.stringify(getDeserializeConstData(statement));
}

function processProperties(schema: any, rawToken: UpDataStructsTokenData)
  : { data: Object, properties: Object } {
  const rawProperties = rawToken.properties;

  const properties : {
    _old_constData?: Object | string,
  } = {};

  rawProperties.forEach(({ key, value }) => {
    const strKey = key.toUtf8();
    let processedValue = null;

    if (['_old_constData'].includes(strKey)) {
      try { processedValue = value.toHex(); } catch (err) { /* */ }
    }

    properties[strKey] = processedValue || value;
  });

  return {
    data: getConstData(properties._old_constData, schema),
    properties,
  };
}

function formatTokenData(tokenId: number, collectionInfo: ICollectionSchemaInfo, rawToken: UpDataStructsTokenData)
  : ITokenDB {
  const { collectionId, schema } = collectionInfo;

  return {
    token_id: tokenId,
    collection_id: collectionId,
    owner: 'string', // todo:
    owner_normalized: 'string', // todo:
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
