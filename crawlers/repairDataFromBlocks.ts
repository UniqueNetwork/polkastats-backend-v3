import { ApiPromise } from '@polkadot/api';
import { Sdk } from '@unique-nft/sdk';
import { Sequelize } from 'sequelize/types';
import blockDB from '../lib/block/blockDB';
import { BlockListener } from './blockListener';
import { ICrawlerModuleConstructorArgs } from './crawlers.interfaces';

class Rescanner extends BlockListener {
  constructor(
    protected api: ApiPromise,
    protected sdk: Sdk,
    protected sequelize: Sequelize,
    readonly COUNT_OF_BLOCKS: number,
  ) {
    super(api, sdk, sequelize);
  }

  private async getBlocks(): Promise<any[]> {
    return blockDB.getBlocksForRescan({
      sequelize: this.sequelize,
      limit: this.COUNT_OF_BLOCKS,
    });
  }

  public async rescan(): Promise<void> {
    const blocks = await this.getBlocks();

    if (blocks.length === 0) {
      return;
    }
    await Promise.all(blocks.map(({ block_number }) => this.blockProcessing(block_number)));

    await this.rescan();
  }
}

export async function start({
  api, sdk, sequelize, config
}: ICrawlerModuleConstructorArgs) {
  const rescanner = new Rescanner(api, sdk, sequelize, config.countOfParallelTasks);
  await rescanner.rescan();
}
