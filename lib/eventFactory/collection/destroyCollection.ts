import { Transaction } from 'sequelize/types';
import collectionDB from '../../collection/collectionDB';
import { EventCollection } from '../eventCollection';

export class DestroyCollection extends EventCollection {
  async save(transaction: Transaction) {
    await collectionDB.del({
      collectionId: this.collectionId,
      sequelize: this.sequelize,
      transaction,
    });
  }
}
