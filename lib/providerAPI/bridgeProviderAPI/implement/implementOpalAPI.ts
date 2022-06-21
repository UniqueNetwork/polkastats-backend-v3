import {
  UpDataStructsCollectionLimits,
  UpDataStructsRpcCollection,
  UpDataStructsTokenData,
} from '@unique-nft/unique-mainnet-types';
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

  async impGetCollectionCount() {
    const collectionStats = await this.api.rpc.unique.collectionStats();
    return collectionStats?.created.toNumber();
  }

  async impGetToken(collectionId, tokenId): Promise<UpDataStructsTokenData> {
    const tokenData = await this.api.rpc.unique.tokenData(collectionId, tokenId);
    return tokenData || null;
  }

  async impGetTokenCount(collectionId) {
    return (await this.api.rpc.unique.lastTokenId(collectionId)).toNumber();
  }
}
