import pino, { Logger } from 'pino';
import { OpalAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { Sequelize } from 'sequelize/types';
import { ICollectionDbEntity } from '../lib/collection/collectionDbEntity.interface';
import { BridgeAPI } from '../lib/providerAPI/bridgeApi';
import { getFormattedCollectionById } from '../lib/collection/collectionData';
import { save as saveCollectionDb, del as delCollectionDb } from '../lib/collection/collectionDb';
import { ICrawlerModuleConstructorArgs } from './crawlers.interfaces';

class CollectionsScanner {
  private logger: Logger;

  private sequelize: Sequelize;

  private bridgeApi: OpalAPI;

  constructor({ logger } : { logger: Logger }) {
    this.logger = logger;
  }

  private saveCollection(collection: ICollectionDbEntity) : Promise<any> {
    this.logger.trace({ collectionId: collection.collection_id }, 'Save collection');

    return saveCollectionDb({
      collection,
      sequelize: this.sequelize,
      excludeFields: ['date_of_creation'],
    });
  }

  private deleteCollection(collectionId: number) : Promise<any> {
    this.logger.trace({ collectionId }, 'Delete collection');

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
      const collection = await getFormattedCollectionById(collectionId, this.bridgeApi);

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

    this.bridgeApi = bridgeAPI as OpalAPI;

    const { pollingTime } = config;

    this.logger.info(`Starting collections crawler... Polling time is ${pollingTime / 1000} seconds.`);

    this.run(pollingTime);
  }
}

export default new CollectionsScanner({
  logger: pino({ name: 'CollectionsScanner', level: process.env.PINO_LOG_LEVEL || 'info' }),
});
