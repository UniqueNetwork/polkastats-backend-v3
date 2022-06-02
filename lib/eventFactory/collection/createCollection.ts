import { Transaction } from 'sequelize/types';
import { EventCollection } from '../eventCollection';
import { save as saveCollectionDb } from '../../collection/collectionDB';

export class CreateCollection extends EventCollection {
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
      });
    }
  }
}
