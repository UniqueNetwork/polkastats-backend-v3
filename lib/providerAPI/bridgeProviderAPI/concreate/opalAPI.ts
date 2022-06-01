// import { UpDataStructsRpcCollection } from '@unique-nft/types';
import { capitalizeAndMapObject } from '../../../../utils/utils';
import AbstractAPI from './abstractAPI';

export class OpalAPI extends AbstractAPI {
  async getCollection(id) {
    const collection = await this.impl.impGetCollection(id);

    // if (collecton) {
    //   collecton = capitalizeAndMapObject(collecton, (item, key) => {
    //     if (key === 'limits') {
    //       // Capitalize 'limits' object too
    //       const limits = item[key];
    //       // eslint-disable-next-line no-param-reassign
    //       item[key] = capitalizeAndMapObject(limits, (limit, i) => limit[i]);
    //     }
    //     return item[key];
    //   });
    // }
    return collection || null;
  }

  async getToken(collectionId, tokenId) {
    let token = await this.impl.impGetToken(collectionId, tokenId);
    token = capitalizeAndMapObject(token, (item, key) => {
      if (key === 'owner') {
        const owner = item[key];
        // Get only first values by every key
        // eslint-disable-next-line no-param-reassign
        item[key] = Object.entries(owner).reduce((acc, [k, v]) => { acc = { ...acc, [k]: v[0] }; return acc; }, {});
      }
      return item[key];
    });
    return token;
  }

  getCollectionCount() {
    return this.impl.impGetCollectionCount();
  }

  getTokenCount(collectionId) {
    return this.impl.impGetTokenCount(collectionId);
  }
}
