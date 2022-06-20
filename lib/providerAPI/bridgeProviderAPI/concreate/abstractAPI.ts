/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { UpDataStructsRpcCollection, UpDataStructsTokenData } from '@unique-nft/unique-mainnet-types';
import ImplementorAPI from '../implement/implementorAPI';

export default class AbstractAPI {
  constructor(public impl: ImplementorAPI) {}

  get api() {
    return this.impl.api;
  }

  getCollection(collectionId): Promise<UpDataStructsRpcCollection | null> {
    throw new Error('This is method is abastrac');
  }

  getToken(collectionId, tokenId): Promise<UpDataStructsTokenData | null> {
    throw new Error('This is method is abastract');
  }

  getTokenCount(collectionId) {
    throw new Error('This is method is abastract');
  }

  getCollectionCount() {
    throw new Error('This is method is abastract');
  }

  async getBlockHash(blockNumber) {
    return this.impl.impGetBlockHash(blockNumber);
  }
}
