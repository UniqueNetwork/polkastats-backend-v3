import ImplementorAPI from './implementorAPI';

export class ImplementTestnetAPI extends ImplementorAPI {
  async impGetCollection(id) {
    const collection = await this.api.query.nft.collectionById(id);
    return ImplementorAPI.toObject(collection);
  }

  async impGetCollectionCount() {
    const collectionCount = await this.api.query.nft.createdCollectionCount();
    return Number(collectionCount);
  }

  async impGetToken(collectionId, tokenId) {
    const token = await this.api.query.nft.nftItemList(collectionId, tokenId);
    return ImplementorAPI.toObject(token);
  }

  async impGetTokenCount(collectionId) {
    const count = await this.api
      .query
      .nft
      .itemListIndex(collectionId);
    return Number(count);
  }
}
