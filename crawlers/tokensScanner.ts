import pino, { Logger } from 'pino';
import { Sequelize } from 'sequelize/types';
import { OpalAPI } from '../lib/providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from '../lib/providerAPI/bridgeProviderAPI/concreate/testnetAPI';
import { getFormattedToken } from '../lib/token/tokenData';
import { getCollectionsSchemaInfo } from '../lib/collection/collectionDb';
import { ITokenDbEntity } from '../lib/token/tokenDbEntity.interface';
import { BridgeAPI } from '../lib/providerAPI/bridgeApi';
import { save as saveTokenDb, del as delTokenDb } from '../lib/token/tokenDb';
import { ICrawlerModuleConstructorArgs, ICollectionSchemaInfo } from './crawlers.interfaces';

class TokensScanner {
  private logger: Logger;

  private sequelize: Sequelize;

  private bridgeApi: OpalAPI | TestnetAPI;

  constructor({ logger } : { logger: Logger }) {
    this.logger = logger;
  }

  private async getCollectionTokens(collectionInfo: ICollectionSchemaInfo) {
    const { collectionId } = collectionInfo;
    const tokensCount = await this.bridgeApi.getTokenCount(collectionId);

    const tokens = [];
    const destroyedTokens: number[] = [];

    for (let tokenId = 1; tokenId <= tokensCount; tokenId++) {
      try {
        const token = await getFormattedToken(tokenId, collectionInfo, this.bridgeApi);
        tokens.push(token);
      } catch (error) {
        destroyedTokens.push(tokenId);
        this.logger.info(
          {
            tokenId,
            collectionId,
          },
          'Can\'t get token in collection. Maybe it was burned.',
        );
      }
    }

    return {
      tokens,
      destroyedTokens,
    };
  }

  private saveTokens(tokens: ITokenDbEntity[]) {
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

    const counts = {
      updated: 0,
      deleted: 0,
      failedCollectionsCount: 0,
      failedColections: [],
    };

    const allCollectionsInfo = await getCollectionsSchemaInfo({ sequelize: this.sequelize });

    for (let i = 0; i < allCollectionsInfo.length; i++) {
      const collectionInfo = allCollectionsInfo[i];
      const { tokens, destroyedTokens } = await this.getCollectionTokens(allCollectionsInfo[i]);

      const { collectionId } = collectionInfo;

      this.logger.trace({
        collectionId,
        tokens: tokens.length,
        destroyedTokens: destroyedTokens.length,
      }, 'Processing collection tokens');

      try {
        await Promise.all([
          this.saveTokens(tokens),
          this.deleteTokens(collectionId, destroyedTokens),
        ]);

        counts.updated += tokens.length;
        counts.deleted += destroyedTokens.length;
      } catch (error) {
        counts.failedColections.push(collectionId);
        counts.failedCollectionsCount++;
        this.logger.error({
          collectionId,
          message: error?.message,
        }, 'Update collection tokens error');
      }
    }

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
