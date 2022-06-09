import { UpDataStructsRpcCollection } from '@unique-nft/types';
import AbstractAPI from './abstractAPI';

export class TestnetAPI extends AbstractAPI {
  async getCollection(id): Promise<UpDataStructsRpcCollection | null> {
    const result = await this.impl.impGetCollection(id);
    return result || null;
  }

  async getToken(collectionId, tokenId) {
    const token = await this.impl.impGetToken(collectionId, tokenId);
    return token;
  }

  async getCollectionCount() {
    const count = await this.impl.impGetCollectionCount();
    return count;
  }

  async getTokenCount(collectionId) {
    return this.impl.impGetTokenCount(collectionId);
  }
}
