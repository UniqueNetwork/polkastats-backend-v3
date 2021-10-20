const _ = require('lodash');
const { getCollection, saveCollection } = require('./collectionListener');
const { getToken, checkToken, saveToken, deleteToken, moveToken} = require('./tokenListener');

const TYPE_CREATE_COLLECTION = 'CollectionCreated'
const TYPE_CREATE_TOKEN = 'ItemCreated'
const TYPE_ITEM_DESTROYED = 'ItemDestroyed'
const TYPE_TRANSFARE = 'Transfer'
class EventFacade {
  /**
   * 
   * @param {string} type event.method 
   * @param {ApiPromise} api
   */
  constructor(api, pool) {    
    this.api = api
    this.pool = pool
  }  
  /**
   * 
   * @param {Array} data event.data
   * @returns 
   */
  async save(type, data) {    
    switch (type) {
      case TYPE_CREATE_COLLECTION: {                                
        return await this.saveCollection(data)
      }

      case TYPE_CREATE_TOKEN: {
        return await this.insertToken(data)
      }

      case TYPE_ITEM_DESTROYED: {
        return await this.delToken(data)
      }

      case TYPE_TRANSFARE: {
        return await this.transferToken(data)
      }
      
      default: {
        return null;
      }
    }
  }    
  /**
   * 
   * @param {number} collectionId 
   * @returns 
   */
  async saveCollection(data) {          
    const collectionId = data[0];    
    if (_.isNumber(collectionId)) {
      const collection = await getCollection(this.api, collectionId);      
      await saveCollection({
        collection,
        pool: this.pool
      })
    }
    return null;
  }

  async insertToken(data) {    
    if (this.#checkNumber(this.#parseData(data))) {
      const token = await getToken({api:this.api, ...this.#parseData(data)});
      const check = await checkToken(this.pool, token);      
      await saveToken(this.pool,{...token, check});              
    }
  }

  #checkNumber({collectionId, tokenId}) {
    return _.isNumber(collectionId) && _.isNumber(tokenId);
  }

  async delToken(data) {    
    if (this.#checkNumber(this.#parseData(data))) {
      await deleteToken({pool: this.pool, ...this.#parseData(data)})
    }
  }

  async transferToken(data) {    
    if (this.#checkNumber(this.#parseData(data))) {
      await moveToken({
        pool: this.pool,
        ...this.#parseData(data),
        ...this.#parseOwners(data)
      });
    }
  }

  #parseOwners(data) {    
    const sender = data[3];
    return { sender };
  }

  #parseData(data) {
    const tokenId = data[1];
    const collectionId = data[0];
    return { collectionId, tokenId };
  }
}

module.exports = EventFacade;