import { Sequelize } from 'sequelize';
import crawlers from './crawlers/crawlers';
import { wait } from './utils/utils';
import {
  wsProviderUrl,
  typeProvider,
  dbConnect,
} from './config/config';
import { Logger } from './utils/logger';
import { BlockExplorer } from './blockexplorer';
import runtimeTypes from './config/runtime_types.json';
import { ProviderFactory } from './lib/providerAPI/providerAPI';
import { startServer } from './prometheus';

const log = new Logger();

async function getSequlize(sConnect) {
  const db = new Sequelize(
    sConnect,
    {
      logging: false,
      pool: {
        max: 60,
        min: 0,
        acquire: 120000,
        idle: 100000,
      },
    },
  );

  try {
    await db.authenticate();
    // return db;
  } catch (error) {
    log.error(error);
  }

  console.log(db);
  return db;
}

async function getPolkadotAPI(wsUrl, rtt) {
  log.info(`Connecting to ${wsUrl}`);
  const provider = new ProviderFactory(wsUrl, typeProvider);
  const api = await provider.getApi(rtt);

  api.on('error', async (value) => {
    log.error(value);
  });

  api.on('disconnected', async (value) => {
    log.error(value);
  });

  await api.isReady;

  log.info('API is ready!');

  // Wait for node is synced
  let node;
  try {
    node = await api.rpc.system.health();
  } catch (e) {
    log.error({
      message: "Can't connect to node! Waiting 10s...",
      name: 'disconnect',
      stack: e.stack,
    });
    api.disconnect();
    await wait(10000);
    throw e;
  }

  log.info(`Node: ${JSON.stringify(node)}`);

  if (node && node.isSyncing.eq(false)) {
    // Node is synced!
    log.info('Node is synced!');
    return api;
  }
  log.default('Node is not synced! Waiting 10s...');
  api.disconnect();
  await wait(10000);

  return api;
}

async function main() {
  const sequelize = await getSequlize(dbConnect);
  const api = await getPolkadotAPI(wsProviderUrl, runtimeTypes);
  const blockExplorer = new BlockExplorer(api, sequelize, crawlers);
  await blockExplorer.run();

  startServer(() => {
    log.info('Server running...');
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);

  process.exit(-1);
});
