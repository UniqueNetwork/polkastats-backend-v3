import { ApiPromise } from '@polkadot/api';
import { Sdk } from '@unique-nft/sdk';
import { Sequelize } from 'sequelize/types';
import { ICrawlerModule } from './crawlers/crawlers.interfaces';

export default class BlockExplorer {
  constructor(
    private api: ApiPromise,
    private sdk: Sdk,
    private sequelize: Sequelize,
    private crawlers: ICrawlerModule[],
  ) {}

  async run() {
    this.crawlers.filter((crawler) => crawler.enabled)
      .forEach(async (crawler) => {
        await crawler.start({
          api: this.api,
          sdk: this.sdk,
          sequelize: this.sequelize,
          config: crawler.config,
        });
      });
  }
}
