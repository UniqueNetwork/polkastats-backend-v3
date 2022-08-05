/* eslint-disable import/no-duplicates */
import {
  UpDataStructsCollectionLimits,
  UpDataStructsRpcCollection
} from '@unique-nft/unique-mainnet-types';
import { CollectionInfoWithSchema, TokenPropertiesResult, UniqueTokenDecoded } from '@unique-nft/sdk/tokens';
import '@unique-nft/sdk/tokens'; // need this to get sdk.collections and sdk.tokens declarations
import ImplementorAPI from './implementorAPI';

export class ImplementOpalAPI extends ImplementorAPI {
  async impGetCollection(collectionId): Promise<UpDataStructsRpcCollection | null> {
    const result = await this.api.rpc.unique.collectionById(collectionId);
    return result.isSome ? result.value : null;
  }

  async impGetEffectiveCollectionLimits(collectionId): Promise<UpDataStructsCollectionLimits | null> {
    const result = await this.api.rpc.unique.effectiveCollectionLimits(collectionId);
    return result.isSome ? result.value : null;
  }

  async impGetCollectionSdk(collectionId): Promise<CollectionInfoWithSchema | null> {
    return this.sdk.collections.get_new({ collectionId });
  }

  async impGetCollectionCount() {
    const collectionStats = await this.api.rpc.unique.collectionStats();
    return collectionStats?.created.toNumber();
  }

  async impGetToken(collectionId, tokenId): Promise<UniqueTokenDecoded | null> {
    return this.sdk.tokens.get_new({ collectionId, tokenId });
  }

  async impGetTokenCount(collectionId) {
    return (await this.api.rpc.unique.lastTokenId(collectionId)).toNumber();
  }

  async impGetTokenPropertiesSdk(collectionId, tokenId): Promise<TokenPropertiesResult | null> {
    return this.sdk.tokens.properties({ collectionId, tokenId });
  }
}
