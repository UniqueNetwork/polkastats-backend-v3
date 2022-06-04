import pino, { Logger } from 'pino';
import { OpalAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/testnetAPI';
import { Sequelize } from 'sequelize/types';
import { ITokenDB } from '../lib/token/tokenDB.interface';
import { BridgeAPI } from '../lib/providerAPI/bridgeApi';
import { get as getCollectionDb } from '../lib/collection/collectionDB';
import { save as saveTokenDb, del as delTokenDb } from '../lib/token/tokenDB';
import { getTokenById } from '../lib/token/tokenData';
import { ICrawlerModuleConstructorArgs, ITokenCollectionInfoStruct } from './crawlers.interfaces';
import { getProtoBufRoot } from '../utils/protobuf';

class TokensScanner {
  private logger: Logger;

  private sequelize: Sequelize;

  private bridgeApi: OpalAPI | TestnetAPI;

  constructor({ logger } : { logger: Logger }) {
    this.logger = logger;
  }

  private async getAllCollectionsInfo(): Promise<ITokenCollectionInfoStruct[]> {
    const collections = await getCollectionDb({
      selectList: ['collection_id', 'const_chain_schema'],
      sequelize: this.sequelize,
    });
    return collections.map((collection) => ({
      collectionId: Number(collection.collection_id),
      schema: getProtoBufRoot(collection.const_chain_schema),
    }));
  }

  private async getCollectionTokens(collectionInfo: ITokenCollectionInfoStruct) {
    const { collectionId } = collectionInfo;
    const tokensCount = await this.bridgeApi.getTokenCount(collectionId);

    const tokens = [];
    const destroyedTokens: number[] = [];

    for (let tokenId = 1; tokenId <= tokensCount; tokenId++) {
      try {
        const token = await getTokenById(tokenId, collectionInfo, this.bridgeApi);
        tokens.push(token);
      } catch (error) {
        console.log('getCollectionTokens error', error);
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

    const counts = {
      total: 0,
      updated: 0,
      deleted: 0,
      failed: 0,
    };

    let allCollectionsInfo = await this.getAllCollectionsInfo();

    allCollectionsInfo = allCollectionsInfo.filter(({ collectionId }) => [57].includes(collectionId));

    for (let i = 0; i < allCollectionsInfo.length; i++) {
      const collectionInfo = allCollectionsInfo[i];
      const { tokens, destroyedTokens } = await this.getCollectionTokens(allCollectionsInfo[i]);

      const { collectionId } = collectionInfo;

      console.log(collectionId);
      // console.log({ collectionId, tokens, destroyedTokens });
      try {
        // await Promise.all([
        //   this.saveTokens(tokens),
        //   this.deleteTokens(collectionId, destroyedTokens),
        // ]);
      } catch (error) {
        counts.failed++;
        this.logger.error({
          collectionId,
          message: error?.message,
        }, 'Update collection tokens error');
      }
    }

    this.logger.info(counts, 'Full scan done!');

    process.exit(0);
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
