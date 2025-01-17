import { Transaction } from 'sequelize/types';
import { save as saveTokenDb } from '../../token/tokenDb';
import EventToken from './EventToken';

export default class CreateToken extends EventToken {
  async save(transaction: Transaction) {
    const canCreateNewToken = await this.canSave();

    if (canCreateNewToken) {
      const token = await this.getToken();
      await saveTokenDb({
        token,
        transaction,
        sequelize: this.sequelize,
      });
    }
  }
}
