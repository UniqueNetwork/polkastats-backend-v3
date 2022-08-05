import { CollectionInfoWithSchema, TokenPropertiesResult, UniqueTokenDecoded } from '@unique-nft/sdk/tokens';
import {
  UpDataStructsCollectionLimits,
  UpDataStructsRpcCollection,
} from '@unique-nft/unique-mainnet-types';
import { ImplementOpalAPI } from '../implement/implementOpalAPI';
import AbstractAPI from './abstractAPI';

type CollectionData = {
  collection: UpDataStructsRpcCollection | null,
  effectiveCollectionLimits: UpDataStructsCollectionLimits | null
  collectionSdk: CollectionInfoWithSchema | null
};

export class OpalAPI extends AbstractAPI {
  impl: ImplementOpalAPI;

  async getCollection(id): Promise<CollectionData> {
    const [collection, effectiveCollectionLimits, collectionSdk] = await Promise.all([
      this.impl.impGetCollection(id),
      this.impl.impGetEffectiveCollectionLimits(id),
      this.impl.impGetCollectionSdk(id)
    ]);

    return {
      collection,
      effectiveCollectionLimits,
      collectionSdk
    };
  }

  async getToken(collectionId, tokenId): Promise<{
    tokenDecoded: UniqueTokenDecoded | null,
    tokenProperties: TokenPropertiesResult | null
  }> {
    const [tokenDecoded, tokenProperties] = await Promise.all([
      this.impl.impGetToken(collectionId, tokenId),
      this.impl.impGetTokenPropertiesSdk(collectionId, tokenId)
    ]);

    return {
      tokenDecoded,
      tokenProperties
    };
  }

  getCollectionCount() {
    return this.impl.impGetCollectionCount();
  }

  getTokenCount(collectionId) {
    return this.impl.impGetTokenCount(collectionId);
  }
}
