import { Transaction } from 'sequelize/types';
import { del as delCollectionDb } from '../../collection/collectionDB';
import { EventCollection } from '../eventCollection';

export class DestroyCollection extends EventCollection {
  async save(transaction: Transaction) {
    await delCollectionDb({
      collectionId: this.collectionId,
      sequelize: this.sequelize,
      transaction,
    });
  }
}
