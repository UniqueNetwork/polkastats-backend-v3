import { ApiPromise } from '@polkadot/api';

export default abstract class ImplementorAPI {
  constructor(public api: ApiPromise) {}

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
