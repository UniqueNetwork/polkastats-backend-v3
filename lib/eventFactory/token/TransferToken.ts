import { Transaction } from 'sequelize/types';
import { save as saveTokenDb } from '../../token/tokenDb';
import EventToken from './EventToken';

export default class TransferToken extends EventToken {
  async save(transaction: Transaction) {
    const canSaveToken = await this.canSave();

    if (canSaveToken) {
      const token = await this.getToken();
      await saveTokenDb({
        token,
        transaction,
        excludeFields: ['date_of_creation'],
        sequelize: this.sequelize,
      });
    }
  }
}
