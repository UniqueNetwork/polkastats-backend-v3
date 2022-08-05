/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { ICollectionSchemaInfo } from 'crawlers/crawlers.interfaces';
import { TokenPropertiesResult, UniqueTokenDecoded } from '@unique-nft/sdk/tokens';
import { normalizeSubstrateAddress, sanitizePropertiesValues } from '../../utils/utils';
import { ITokenDbEntity } from './tokenDbEntity.interface';
import { OpalAPI } from '../providerAPI/bridgeProviderAPI/concreate/opalAPI';

function formatTokenData({
  tokenDecoded,
  tokenProperties
}: {
  tokenDecoded: UniqueTokenDecoded,
  tokenProperties: TokenPropertiesResult
})
  : ITokenDbEntity {
  const {
    tokenId: token_id,
    collectionId: collection_id,
    image,
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
    data: { image },
    attributes: JSON.stringify(attributes),
    properties: tokenProperties
      ? JSON.stringify(sanitizePropertiesValues(tokenProperties))
      : '[]',
    parent_id: parentId,
  };
}

export async function getFormattedToken(tokenId: number, collectionInfo: ICollectionSchemaInfo, bridgeAPI: OpalAPI)
  : Promise<ITokenDbEntity | null> {
  const { collectionId } = collectionInfo;
  const { tokenDecoded, tokenProperties } = await bridgeAPI.getToken(collectionId, tokenId);

  return tokenDecoded ? formatTokenData({
    tokenDecoded,
    tokenProperties
  }) : null;
}
