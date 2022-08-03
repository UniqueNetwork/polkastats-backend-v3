import blockDB from '../lib/block/blockDB';
import { BlockListener } from './blockListener';
import blockData from '../lib/block/blockData';
import { ICrawlerModuleConstructorArgs } from './crawlers.interfaces';

export interface IBlocksGap {
  gapStart: number;
  gapEnd: number;
}

class OldBlockListener extends BlockListener {
  public async getBlocksGaps(): Promise<IBlocksGap[]> {
    const blocksGaps: IBlocksGap[] = await blockDB.getBlocksGaps({ sequelize: this.sequelize });
    const firstBlockFromDB = await blockDB.firstBlock(this.sequelize);
    const lastBlockFromDB = await blockDB.lastBlock(this.sequelize);
    const lastBlockFromBlockchain = await blockData.last(this.bridgeApi);

    if (firstBlockFromDB > 0) {
      blocksGaps.unshift({
        gapStart: 0,
        gapEnd: firstBlockFromDB - 1,
      });
    }

    if (lastBlockFromDB && lastBlockFromDB !== lastBlockFromBlockchain) {
      blocksGaps.push({
        gapStart: lastBlockFromDB + 1,
        gapEnd: lastBlockFromBlockchain,
      });
    }

    if (blocksGaps.length === 0 && lastBlockFromBlockchain > 0) {
      blocksGaps.push({
        gapStart: 0,
        gapEnd: lastBlockFromBlockchain,
      });
    }

    return blocksGaps;
  }

  public async scanRangeOfBlocks(blocksGap: IBlocksGap): Promise<void> {
    const gapStart = Number(blocksGap.gapStart);
    const gapEnd = Number(blocksGap.gapEnd);

    this.logger.info(`Repair block gaps for: ${JSON.stringify(blocksGap)}`);

    for (let blockNumber = gapStart; blockNumber <= gapEnd; blockNumber++) {
      await this.blockProcessing(blockNumber);
    }
  }
}

export async function start({ api, sdk, sequelize }: ICrawlerModuleConstructorArgs) {
  const blockListener = new OldBlockListener(api, sdk, sequelize);
  const blocksGaps = await blockListener.getBlocksGaps();
  // eslint-disable-next-line no-restricted-syntax
  for (const blockGap of blocksGaps) {
    await blockListener.scanRangeOfBlocks(blockGap);
  }
}
