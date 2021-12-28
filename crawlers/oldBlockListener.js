const { BridgeAPI } = require('../lib/providerAPI/bridgeApi');
const { Logger } = require('../utils/logger');
const blockDB = require('../lib/blockDB.js');
const blockData = require('../lib/blockData.js');
const eventsData = require('../lib/eventsData.js');
const {
  shortHash,
  storeExtrinsics,
  updateTotals,
  genArrayRange,
} = require('../utils/utils.js');
const eventsDB = require('../lib/eventsDB.js');
const { QueryTypes } = require('sequelize');

const loggerOptions = {
  crawler: `oldBlockListener`,
};

async function syncBlock({
  sequelize,
  bridgeAPI,
  blockNumber,
  logger,
  loggerOptions,
}) {
  logger.info(`Syncing block ${blockNumber}`);

  const blockInfo = await blockData.get({ bridgeAPI, blockNumber });
  const events = await eventsData.get({ bridgeAPI, blockHash: blockInfo.blockHash });
  const timestampMs = await bridgeAPI.api.query.timestamp.now.at(blockInfo.blockHash);
  const sessionLength = (
    bridgeAPI.api.consts?.babe?.epochDuration || 0
  ).toString();

  await blockDB.add({
    blockNumber,
    block: Object.assign(blockInfo, events, { timestampMs, sessionLength }),
    sequelize,
  });

  await storeExtrinsics(
    sequelize,
    blockNumber,
    blockInfo.extrinsics,
    events.blockEvents,
    timestampMs,
    loggerOptions
  );

  await eventsData.events(events.blockEvents, async (record, index) => {
    const res = await eventsDB.get({
      blockNumber,
      index,
      sequelize,
    });

    const preEvent = Object.assign(
      {
        block_number: blockNumber,
        event_index: index,
        timestamp: Math.floor(timestampMs / 1000),
      },
      eventsData.parseRecord(record)
    );

    if (!res) {
      await eventsDB.add({ event: preEvent, sequelize });

      logger.info(
        `Added event #${blockNumber}-${index} ${preEvent.section} ➡ ${preEvent.method}`
      );
    }
  });
  updateTotals(sequelize, loggerOptions);
}

async function start({ api, sequelize, config }) {
  const logger = new Logger();

  logger.start(`Starting block listener for old blocks...`);

  const blocksGaps = await blockDB.getBlocksGaps({ sequelize });

  logger.info(`${blocksGaps.length} gaps founded`);
  logger.info('blocksGaps: ', blocksGaps);

  const bridgeAPI = new BridgeAPI(api).bridgeAPI;

  blocksGaps.forEach(async (blockGap) => {
    logger.info(`Filling gap between block number ${blockGap.gapStart}-${blockGap.gapEnd}`);

    const gapStart = Number(blockGap.gapStart);
    const gapEnd = Number(blockGap.gapEnd);

    for (let blockNumber = gapStart + 1; blockNumber < gapEnd; blockNumber++) {
      await syncBlock({
        sequelize,
        bridgeAPI,
        blockNumber,
        logger,
        loggerOptions,
      });
    }
  });
}

module.exports = { start };
