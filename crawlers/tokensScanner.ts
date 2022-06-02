import { OpalAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/testnetAPI';
import { Sequelize } from 'sequelize/types';
import pino, { Logger } from 'pino';
import { ITokenDB } from 'lib/token/tokenDB.interface';
import { BridgeAPI } from '../lib/providerAPI/bridgeApi';
import { save as saveTokenDb, del as delTokenDb } from '../lib/token/tokenDB';
import { ICrawlerModuleConstructorArgs } from './crawlers.interfaces';

class TokensScanner {
  private logger: Logger;

  private sequelize: Sequelize;

  private bridgeApi: OpalAPI | TestnetAPI;

  constructor({ logger } : { logger: Logger }) {
    this.logger = logger;
  }

  private saveTokens(tokens: ITokenDB[]) {
    return Promise.all(tokens.map((token) => saveTokenDb({
      token,
      sequelize: this.sequelize,
      excludeFields: ['date_of_creation'],
    })));
  }

  private deleteTokens(
    collectionId: number,
    tokenIds: number[],
  ) {
    return Promise.all(tokenIds.map((tokenId) => delTokenDb({
      tokenId,
      collectionId,
      sequelize: this.sequelize,
    })));
  }

  private async scanTokens() {
    this.logger.info('Run full scan');

    // const collectionsCount = await this.bridgeApi.getCollectionCount();
    const counts = {
      total: 0,
      updated: 0,
      deleted: 0,
      failed: 0,
    };

    // for (let collectionId = 1; collectionId <= collectionsCount; collectionId++) {
    //   const collection = await getCollectionById(collectionId, this.bridgeApi);

    //   // console.log('collectionId', collectionId, collection);
    //   // process.exit(0);

    //   try {
    //     if (collection) {
    //       await this.saveCollection(collection);
    //       counts.updated++;
    //     } else {
    //       await this.deleteCollection(collectionId);
    //       counts.deleted++;
    //     }
    //   } catch (error) {
    //     counts.failed++;
    //     this.logger.error({
    //       collectionId,
    //       message: error?.message,
    //     }, 'Update collection error');
    //   }
    // }

    this.logger.info(counts, 'Full scan done!');
  }

  /**
   * Runs full collections scan every 'pollingTime' ms.
   */
  private async run(pollingTime: number) {
    await this.scanTokens();

    setTimeout(() => this.run(pollingTime), pollingTime);
  }

  async start({ api, sequelize, config }: ICrawlerModuleConstructorArgs) {
    this.sequelize = sequelize;

    const { bridgeAPI } = new BridgeAPI(api);
    this.bridgeApi = bridgeAPI;

    const { pollingTime } = config;

    this.logger.info(`Starting tokens crawler... Polling time is ${pollingTime / 1000} seconds.`);

    this.run(pollingTime);
  }
}

export default new TokensScanner({
  logger: pino({ name: 'TokensScanner', level: process.env.PINO_LOG_LEVEL || 'info' }),
});
