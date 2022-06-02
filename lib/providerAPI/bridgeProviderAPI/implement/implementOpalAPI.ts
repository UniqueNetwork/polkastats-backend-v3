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
    const tokenData = await this.api.rpc.unique.tokenData(collectionId, tokenId);

    console.log('tokenData', tokenData.toJSON());

    // todo: remove me
    interface IObjectWithOwner {
      owner?: string;
    }
    const data = tokenData.toJSON() as IObjectWithOwner;

    console.log(this.api.rpc.unique, this.api.rpc.unique.constMetadata, this.api.rpc.unique.variableMetadata);

    try {
      // const constData = await this.api.rpc.unique.constMetadata(
      //   collectionId,
      //   tokenId,
      // );
      // console.log('constData', constData.toJSON());

      const variableMetadata = await this.api.rpc.unique.variableMetadata(
        collectionId,
        tokenId,
      );

      console.log('variableMetadata', variableMetadata.toJSON());
    } catch (err) {
      console.log('Error', err);
    }

    // todo: debug
    return tokenData || null;
    // return {
    //   owner: data?.owner,
    //   // constData: constData.toJSON(),
    //   // variableData: variableMetadata.toJSON(),
    // };
  }

  async impGetTokenCount(collectionId) {
    const count = (
      await this.api.rpc.unique.lastTokenId(collectionId)
    ).toJSON();
    return count;
  }
}
