import { ApiPromise } from '@polkadot/api';
import { UpDataStructsRpcCollection, UpDataStructsTokenData } from '@unique-nft/unique-mainnet-types';

export default abstract class ImplementorAPI {
  constructor(public api: ApiPromise) {}

  abstract impGetCollection(collectionId): Promise<UpDataStructsRpcCollection | null>;

  abstract impGetCollectionCount(): Promise<number>;

  abstract impGetTokenCount(collectionId): Promise<number>;

  abstract impGetToken(collectionId, tokenId): Promise<UpDataStructsTokenData | null>;

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
