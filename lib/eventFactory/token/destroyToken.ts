import { Transaction } from 'sequelize/types';
import tokenDB from '../../../lib/tokenDB';
import { EventToken } from '../eventToken';

export class DestroyToken extends EventToken {
  async save(transaction: Transaction) {
    if (this.collectionId && this.tokenId) {
      await tokenDB.del(this.tokenId, this.collectionId, this.sequelize, transaction);
    }
  }
}
