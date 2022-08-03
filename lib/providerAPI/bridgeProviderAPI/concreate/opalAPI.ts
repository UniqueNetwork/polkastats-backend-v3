import { CollectionInfoWithSchema } from '@unique-nft/sdk/tokens';
import { UpDataStructsCollectionLimits, UpDataStructsRpcCollection } from '@unique-nft/unique-mainnet-types';
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

  async getToken(collectionId, tokenId) {
    const token = await this.impl.impGetToken(collectionId, tokenId);
    return token || null;
  }

  getCollectionCount() {
    return this.impl.impGetCollectionCount();
  }

  getTokenCount(collectionId) {
    return this.impl.impGetTokenCount(collectionId);
  }
}
