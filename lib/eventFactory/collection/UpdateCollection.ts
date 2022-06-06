import { Transaction } from 'sequelize/types';
import EventCollection from './EventCollection';
import { save as saveCollectionDb } from '../../collection/collectionDB';

export default class UpdateCollection extends EventCollection {
  public async save(transaction: Transaction): Promise<void> {
    const isDestroyed = await this.isDestroyed();

    if (isDestroyed) {
      return;
    }

    const collection = await this.getCollection();

    if (collection) {
      await saveCollectionDb({
        collection,
        sequelize: this.sequelize,
        transaction,
        excludeFields: ['date_of_creation'],
      });
    }
  }
}
