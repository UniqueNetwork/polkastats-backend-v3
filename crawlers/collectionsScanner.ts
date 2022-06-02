import { OpalAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/testnetAPI';
import { Sequelize } from 'sequelize/types';
import pino, { Logger } from 'pino';
import { ICollectionDB } from '../lib/collection/collectionDB.interface';
import { BridgeAPI } from '../lib/providerAPI/bridgeApi';
import { getCollectionById } from '../lib/collection/collectionData';
import { save as saveCollectionDb, del as delCollectionDb } from '../lib/collection/collectionDB';
import { ICrawlerModuleConstructorArgs } from './crawlers.interfaces';

class CollectionsScanner {
  private logger: Logger;

  private sequelize: Sequelize;

  private bridgeApi: OpalAPI | TestnetAPI;

  constructor({ logger } : { logger: Logger }) {
    this.logger = logger;
  }

  private saveCollection(collection: ICollectionDB) : Promise<any> {
    this.logger.debug(`Save collection with id: ${collection.collection_id}`);

    return saveCollectionDb({
      collection,
      sequelize: this.sequelize,
      excludeFields: ['date_of_creation'],
    });
  }

  private deleteCollection(collectionId: number) : Promise<any> {
    this.logger.debug(`Delete collection with id: ${collectionId}`);

    return delCollectionDb({
      collectionId,
      sequelize: this.sequelize,
    });
  }

  private async scanCollections() {
    this.logger.info('Run full scan');

    const collectionsCount = await this.bridgeApi.getCollectionCount();
    const counts = {
      total: collectionsCount,
      updated: 0,
      deleted: 0,
      failed: 0,
    };

    for (let collectionId = 1; collectionId <= collectionsCount; collectionId++) {
      const collection = await getCollectionById(collectionId, this.bridgeApi);

      // console.log('collectionId', collectionId);

      try {
        if (collection) {
          await this.saveCollection(collection);
          counts.updated++;
        } else {
          await this.deleteCollection(collectionId);
          counts.deleted++;
        }
      } catch (error) {
        counts.failed++;
        this.logger.error({
          collectionId,
          message: error?.message,
        }, 'Update collection error');
      }
    }

    this.logger.info(counts, 'Full scan done!');

    // process.exit(0);
  }

  /**
   * Runs full collections scan every 'pollingTime' ms.
   */
  private async run(pollingTime: number) {
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
