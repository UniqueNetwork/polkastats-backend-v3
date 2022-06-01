import { Transaction } from 'sequelize/types';
import { EventCollection } from '../eventCollection';
import collectionDB from '../../collection/collectionDB';

export class UpdateCollection extends EventCollection {
  public async save(transaction: Transaction): Promise<void> {
    const isDestroyed = await this.isDestroyed();

    if (isDestroyed) {
      return;
    }

    const collection = await this.getCollection();

    if (collection) {
      await collectionDB.save({
        collection,
        sequelize: this.sequelize,
        transaction,
        excludeFields: ['date_of_creation'],
      });
    }
  }
}
