import { ApiPromise } from '@polkadot/api';
import { Sdk } from '@unique-nft/sdk';

export default abstract class ImplementorAPI {
  constructor(public api: ApiPromise, public sdk: Sdk) {}

  abstract impGetCollection(collectionId): Promise<unknown>;

  abstract impGetEffectiveCollectionLimits(collectionId): Promise<unknown>;

  abstract impGetCollectionCount(): Promise<number>;

  abstract impGetTokenCount(collectionId): Promise<number>;

  abstract impGetToken(collectionId, tokenId): Promise<unknown>;

  async impGetBlockHash(blockNumber) {
    return this.api.rpc.chain.getBlockHash(blockNumber);
  }

  static toObject(aValue) {
    let result = aValue;
    if (!('Owner' in aValue)) {
      result = { ...result.toJSON() };
    }
    return result;
  }
}
