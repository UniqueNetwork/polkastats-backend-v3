import { Transaction } from 'sequelize/types';
import { del as delCollectionDb } from '../../collection/collectionDB';
import EventCollection from './EventCollection';

export default class DestroyCollection extends EventCollection {
  async save(transaction: Transaction) {
    await delCollectionDb({
      collectionId: this.collectionId,
      sequelize: this.sequelize,
      transaction,
    });
  }
}
