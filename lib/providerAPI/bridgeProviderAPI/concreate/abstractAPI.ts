/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import ImplementorAPI from '../implement/implementorAPI';

export default class AbstractAPI {
  private readonly errorMgs = 'This method is abastract';

  constructor(public impl: ImplementorAPI) {}

  get api() {
    return this.impl.api;
  }

  getCollection(collectionId): Promise<unknown> {
    throw new Error(this.errorMgs);
  }

  getToken(collectionId, tokenId): Promise<unknown> {
    throw new Error(this.errorMgs);
  }

  getTokenCount(collectionId) {
    throw new Error(this.errorMgs);
  }

  getCollectionCount() {
    throw new Error(this.errorMgs);
  }

  async getBlockHash(blockNumber) {
    return this.impl.impGetBlockHash(blockNumber);
  }
}
