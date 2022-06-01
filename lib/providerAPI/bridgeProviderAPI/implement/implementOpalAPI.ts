import ImplementorAPI from './implementorAPI';

export class ImplementOpalAPI extends ImplementorAPI {
  async impGetCollection(collectionId) {
    const result = await this.api.rpc.unique.collectionById(collectionId);
    return result.isSome ? result.value : null;
  }

  async impGetCollectionCount() {
    const collectionStats = await this.api.rpc.unique.collectionStats();
    return collectionStats?.created.toNumber();
  }

  async impGetToken(collectionId, tokenId) {
    const tokenData = await this.api.query.nonfungible.tokenData(collectionId, tokenId);

    // todo: remove me
    interface IObjectWithOwner {
      owner?: string;
    }
    const data = tokenData.toJSON() as IObjectWithOwner;

    const constData = await this.api.rpc.unique.constMetadata(
      collectionId,
      tokenId,
    );
    const variableMetadata = await this.api.rpc.unique.variableMetadata(
      collectionId,
      tokenId,
    );

    return {
      owner: data?.owner,
      constData: constData.toJSON(),
      variableData: variableMetadata.toJSON(),
    };
  }

  async impGetTokenCount(collectionId) {
    const count = (
      await this.api.rpc.unique.lastTokenId(collectionId)
    ).toJSON();
    return count;
  }
}
