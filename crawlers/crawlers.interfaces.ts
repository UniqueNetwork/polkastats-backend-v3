import { ApiPromise } from '@polkadot/api';
import { Sequelize } from 'sequelize/types';

export interface ICrawlerModuleConfig {
  pollingTime: number;
  countOfParallelTasks?: number;
}

export interface ICrawlerModuleConstructorArgs {
  api: ApiPromise;
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
