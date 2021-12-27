const collectionDB = require('../../collectionDB.js');
const { EventAccountCollection } = require('../eventAccountCollection.js');


class AddToWhiteList extends EventAccountCollection {
  async save() {
    if (this.data.collectionId) {
      const collection = await this.getCollection();
      const update = {
        collection,
        sequelize: this.sequelize
      }
      await collectionDB.modify(update);
    }
  }
}

module.exports = { AddToWhiteList };