import {
  ACTIVE_ACCOUNTS_DEFAULT_POLLING_TIME_MS,
  DEFAULT_COUNT_OF_PARALLEL_TASKS,
  DEFAULT_POLLING_TIME_MS,
} from '../config/config';
import { start as systemStart } from './system';
import { start as repairDataFromBlocksStart } from './repairDataFromBlocks';
import { start as blockListenerStart } from './blockListener';
import { start as activeAccountsStart } from './activeAccounts';
import { start as chainStart } from './chain';
import collectionsScanner from './collectionsScanner';
import { start as tokenListenerStart } from './tokenListener';
import { start as oldBlockListenerStart } from './oldBlockListener';
import { ICrawlerModule } from './crawlers.interfaces';

const crawlers: ICrawlerModule[] = [
  {
    enabled: !process.env.CRAWLER_SYSTEM_DISABLE,
    start: systemStart,
  },
  {
    enabled: !process.env.CRAWLER_REPAIR_DATA_FROM_BLOCKS_DISABLE,
    start: repairDataFromBlocksStart,
    config: {
      pollingTime:
        parseInt(process.env.CRAWLER_REPAIR_DATA_FROM_BLOCKS_POLLING_TIME_MS)
        || DEFAULT_POLLING_TIME_MS,
      countOfParallelTasks:
        parseInt(process.env.CRAWLER_REPAIR_DATA_FROM_BLOCKS_TASKS_IN_PARALLEL)
        || DEFAULT_COUNT_OF_PARALLEL_TASKS,
    },
  },
  {
    enabled: !process.env.CRAWLER_BLOCK_LISTENER_DISABLE,
    start: blockListenerStart,
  },
  {
    enabled: !process.env.CRAWLER_ACTIVE_ACCOUNTS_DISABLE,
    start: activeAccountsStart,
    config: {
      pollingTime:
        parseInt(process.env.CRAWLER_ACTIVE_ACCOUNTS_POLLING_TIME_MS)
        || ACTIVE_ACCOUNTS_DEFAULT_POLLING_TIME_MS,
      countOfParallelTasks:
        parseInt(process.env.CRAWLER_ACTIVE_ACCOUNTS_TASKS_IN_PARALLEL)
        || DEFAULT_COUNT_OF_PARALLEL_TASKS,
    },
  },
  {
    enabled: !process.env.CRAWLER_CHAIN_DISABLE,
    start: chainStart,
  },
  {
    enabled: !process.env.CRAWLER_COLLECTION_DISABLE,
    start: collectionsScanner.start.bind(collectionsScanner),
    config: {
      pollingTime:
        parseInt(process.env.CRAWLER_COLLECTION_POLLING_TIME_MS)
        || DEFAULT_POLLING_TIME_MS,
    },
  },
  {
    enabled: !process.env.CRAWLER_TOKEN_DISABLE,
    start: tokenListenerStart,
    config: {
      pollingTime:
        parseInt(process.env.CRAWLER_TOKEN_POLLING_TIME_MS)
        || DEFAULT_POLLING_TIME_MS,
    },
  },
  {
    enabled: !process.env.CRAWLER_OLD_BLOCK_LISTENER_DISABLE,
    start: oldBlockListenerStart,
  },
];

export default crawlers;
