const pino = require('pino');

const logger = pino();
const extrinsicDB = require('./extrinsicDB');
const extrinsicData = require('./extrinsicData');
const { getExtrinsicSuccess, getExtrinsicAmount, getExtrinsicFee } = require('../utils/utils');

async function save({
  sequelize,
  blockNumber,
  extrinsics,
  parsedEvents,
  timestampMs,
  loggerOptions,
  transaction,
}) {
  const startTime = new Date().getTime();
  await Promise.all(extrinsics.map(async (extrinsic, index) => {
    const extrinsicParsedEvents = parsedEvents.filter(({ extrinsicIndex }) => extrinsicIndex === index);
    const item = extrinsicData.get({
      blockNumber,
      extrinsic,
      index,
      success: getExtrinsicSuccess(extrinsicParsedEvents),
      amount: getExtrinsicAmount(extrinsicParsedEvents),
      fee: getExtrinsicFee(extrinsicParsedEvents),
      timestamp: timestampMs,
    });

    if (['setValidationData'].includes(item.method)) {
      item.args = '[]';
    }

    return extrinsicDB.save({
      extrinsic: item,
      sequelize,
      transaction,
    });
  }));

  // Log execution time
  const endTime = new Date().getTime();
  logger.info(
    loggerOptions,
    `Added ${extrinsics.length} extrinsics in ${(
      (endTime - startTime)
      / 1000
    ).toFixed(3)}s`,
  );
}

module.exports = Object.freeze({
  save,
});
