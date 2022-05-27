import { OpalAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/testnetAPI';
import { Sequelize } from 'sequelize/types';
import pino, { Logger } from 'pino';
import { BridgeAPI } from '../lib/providerAPI/bridgeApi';
import { getCollectionById } from '../lib/collectionData';
import collectionDB from '../lib/collectionDB';
import { ICrawlerModuleConstructorArgs } from './crawlers.interfaces';

class CollectionsScanner {
  private logger: Logger;

  private sequelize: Sequelize;

  private bridgeApi: OpalAPI | TestnetAPI;

  constructor({ logger }) {
    this.logger = logger;
  }

  private saveCollection(collection: any) : Promise<any> {
    this.logger.debug(`Save collection with id: ${collection?.collection_id}`);

    return collectionDB.save({
      collection,
      sequelize: this.sequelize,
      excludeFields: ['date_of_creation'],
    });
  }

  private deleteCollection(collectionId: number) : Promise<any> {
    this.logger.debug(`Delete collection with id: ${collectionId}`);

    return collectionDB.del({
      collectionId,
      sequelize: this.sequelize,
    });
  }

  private async scanCollections() {
    this.logger.info('Run full scan');

    const collectionsCount = await this.bridgeApi.getCollectionCount();
    let existingCollectionCount = 0;
    let burnedCollectionCount = 0;

    for (let collectionId = 1; collectionId <= collectionsCount; collectionId++) {
      const collection = await getCollectionById(collectionId, this.bridgeApi);

      if (collection) {
        await this.saveCollection(collection);
        existingCollectionCount++;
      } else {
        await this.deleteCollection(collectionId);
        burnedCollectionCount++;
      }
    }

    this.logger.info({
      collectionsCount,
      existingCollectionCount,
      burnedCollectionCount,
    }, 'Full scan done!');
  }

  /**
   * Runs full collections scan every 'pollingTime' ms.
   *
   * @param {number} pollingTime
   */
  private async run(pollingTime) {
    await this.scanCollections();
    setTimeout(() => this.run(pollingTime), pollingTime);
  }

  async start({ api, sequelize, config }: ICrawlerModuleConstructorArgs) {
    this.sequelize = sequelize;

    const { bridgeAPI } = new BridgeAPI(api);
    this.bridgeApi = bridgeAPI;

    const { pollingTime } = config;

    this.logger.info(`Starting collection crawler... Polling time is ${pollingTime / 1000} seconds.`);

    this.run(pollingTime);
  }
}

export default new CollectionsScanner({
  logger: pino({ name: 'CollectionsScanner', level: process.env.PINO_LOG_LEVEL || 'info' }),
});
