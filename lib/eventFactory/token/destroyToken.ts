import { Transaction } from 'sequelize/types';
import { del as delTokenDb } from '../../token/tokenDB';
import { EventToken } from '../eventToken';

export class DestroyToken extends EventToken {
  async save(transaction: Transaction) {
    await delTokenDb({
      tokenId: this.tokenId,
      collectionId: this.collectionId,
      sequelize: this.sequelize,
      transaction,
    });
  }
}
