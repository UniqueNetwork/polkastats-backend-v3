import AbstractAPI from './abstractAPI';

export class OpalAPI extends AbstractAPI {
  async getCollection(id) {
    const collection = await this.impl.impGetCollection(id);
    return collection || null;
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
