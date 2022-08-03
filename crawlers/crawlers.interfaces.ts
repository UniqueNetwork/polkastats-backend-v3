import { ApiPromise } from '@polkadot/api';
import { Sdk } from '@unique-nft/sdk';
import { Sequelize } from 'sequelize/types';

export interface ICrawlerModuleConfig {
  pollingTime: number;
  countOfParallelTasks?: number;
}

export interface ICrawlerModuleConstructorArgs {
  api: ApiPromise;
  sdk: Sdk;
  sequelize: Sequelize;
  config: ICrawlerModuleConfig;
}

export interface ICrawlerModule {
  enabled: boolean;
  start: (args: ICrawlerModuleConstructorArgs) => Promise<void>;
  config?: ICrawlerModuleConfig;
}

export interface ICollectionSchemaInfo {
  collectionId: number,
  schema: any
}
