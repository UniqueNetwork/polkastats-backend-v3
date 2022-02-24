const { wsProviderUrl, typeProvider,  dbConnect, crawlers } = require('./config/config')
const { Sequelize } = require('sequelize');
const { Logger } = require('./utils/logger');
const { BlockExplorer } = require('./blockexplorer')
const rtt = require('./config/runtime_types.json');
const { ProvierFactory } = require('./lib/providerAPI/providerAPI');
const { startServer, closeServer } = require('./prometheus');


const log = new Logger();

const sequelize = new Sequelize(dbConnect);

async function getPolkadotAPI(wsProviderUrl, rtt) {
  log.info(`Connecting to ${wsProviderUrl}`);
  const provider = new  ProvierFactory(wsProviderUrl, typeProvider);  
  const api = await provider.getApi(rtt);


  api.on("error", async (value) => {
    log.error(value);
  });

  api.on("disconnected", async (value) => {
    log.error(value);
  });

  await api.isReady;

  log.info("API is ready!");

  // Wait for node is synced
  let node;
  try {
    node = await api.rpc.system.health();
  } catch {
    log.error({
      message: "Can't connect to node! Waiting 10s...",
      name: "disconnect",
    });
    api.disconnect();
    await wait(10000);
    return false;
  }

  log.info(`Node: ${JSON.stringify(node)}`);

  if (node && node.isSyncing.eq(false)) {
    // Node is synced!
    log.info("Node is synced!");    
    return api;
  } else {
    log.default("Node is not synced! Waiting 10s...");
    api.disconnect();
    await wait(10000);
  }
  return false;
}

async function main() {
  try {
    await sequelize.authenticate();
    
    const api = await getPolkadotAPI(wsProviderUrl, rtt);    
    const blockExplorer = new BlockExplorer({
      api, sequelize, crawlers
    });  
    
    await blockExplorer.run()
  
    startServer(() => {
      log.info('Server running...')
    });  
    
  } catch (error) {
    log.error;
  }    
}

process.on('SIGTERM', () => {    
  closeServer(() => {
    log.info('Close server');
  });

  const hightestTimeoutId = setTimeout(() => {
    console.log('Closed');
    process.exit(-1);
  }, 2000);

  for (let i = 0; i < hightestTimeoutId; i++) {
    clearTimeout(i);
  }

  sequelize.close().then((_) => {
    log.info('Close connection with PostgreSQL');          
  }).catch((error) => {
    log.error(error);    
  })
});

main().catch((error) => {  
  console.error(error);  
  process.exit(-1);
});