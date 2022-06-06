/* eslint-disable no-underscore-dangle */
import { ICollectionSchemaInfo } from 'crawlers/crawlers.interfaces';
import { UpDataStructsTokenData } from '@unique-nft/types';
import { AnyJson } from '@polkadot/types/types';
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
      // console.error(error);
      result.hex = statement.constData?.toString().replace('0x', '') || statement.constData;
    }
  } else {
    result.hex = statement.constData?.toString().replace('0x', '') || statement.constData;
  }
  return result;
}

// function toObject(token) {
//   let result = {};
//   if (!('Owner' in token)) {
//     result = Object.assign(result, token.toJSON());
//   }
//   return result;
// }

function getConstData(constData, schema) {
  const statement = parseConstData(constData, schema);

  return JSON.stringify(getDeserializeConstData(statement));
}

// function getToken(aToken) {
//   let result = null;
//   if (aToken?.Owner) {
//     result = getData(aToken);
//   }
//   return result;
// }

// async function get({
//   collection, tokenId, bridgeAPI,
// }) {
//   const token = await bridgeAPI.getToken(collection.collectionId, tokenId);
//   return getToken(
//     Object.assign(token, {
//       collectionId: collection.collectionId,
//       tokenId,
//       schema: collection.schema,
//     }),
//   );
// }

function processProperties(schema: any, rawToken: UpDataStructsTokenData)
  : { data: Object, properties: Object } {
  const properties: AnyJson & { _old_constData?: any } = rawToken.properties.toJSON();

  console.log('properties', properties);

  return {
    data: getConstData(properties?._old_constData, schema),
    properties,
  };
}

function formatTokenData(tokenId: number, collectionInfo: ICollectionSchemaInfo, rawToken: UpDataStructsTokenData)
  : ITokenDB {
  // console.log('rawToken toJSON()', collectionInfo, tokenId, rawToken.toJSON());

  const { collectionId, schema } = collectionInfo;
  return {
    token_id: tokenId,
    collection_id: collectionId,
    owner: 'string',
    owner_normalized: 'string',
    ...processProperties(schema, rawToken),
  };
}

export async function getFormattedToken(tokenId: number, collectionInfo: ICollectionSchemaInfo, bridgeAPI: OpalAPI)
  : Promise<ITokenDB | null> {
  const { collectionId } = collectionInfo;
  const rawToken = await bridgeAPI.getToken(collectionId, tokenId);

  if (rawToken && rawToken.properties.length) {
    console.log('with props', { collectionId, tokenId, token: rawToken.toJSON() });
  }
  // return null;
  return rawToken ? formatTokenData(tokenId, collectionInfo, rawToken) : null;
}
