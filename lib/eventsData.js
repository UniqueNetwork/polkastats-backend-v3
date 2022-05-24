const { EVENT_SECTION, EVENT_METHOD } = require('../constants');
const { getAmount } = require('../utils/utils');

async function get({
  bridgeAPI,
  blockHash,
}) {
  const result = {};

  const blockEvents = await bridgeAPI.api.query.system.events.at(blockHash);

  result.blockEvents = blockEvents;

  result.numTransfers = blockEvents.filter(
    (record) => record.event.section === EVENT_SECTION.BALANCES
      && record.event.method === EVENT_METHOD.TRANSFER,
  ).length || 0;

  result.newAccounts = blockEvents.filter(
    (record) => record.event.section === EVENT_SECTION.BALANCES
      && record.event.method === EVENT_METHOD.ENDOWED,
  ).length || 0;

  return result;
}

function parseAmount(event) {
  const { method, data, section } = event;

  let result = '0';
  let amountIndex = null;

  /*
   * Extract amount value from event data.
   * The index of amount value depends on the event section and method values.
   * See: https://polkadot.js.org/docs/substrate/events
   *
   * todo: Need to get amount values from all the events that can have ammount values.
   */
  if ([EVENT_METHOD.TRANSFER, EVENT_METHOD.DEPOSIT, EVENT_METHOD.WITHDRAW].includes(method)) {
    if (section === EVENT_SECTION.BALANCES) {
      amountIndex = method === EVENT_METHOD.DEPOSIT || method === EVENT_METHOD.WITHDRAW ? 1 : 2;
    } else if (section === EVENT_SECTION.TREASURY) {
      amountIndex = 0;
    }

    if (amountIndex !== null) {
      result = getAmount(data[amountIndex].toString());
    }
  }

  return result;
}

function parseRecord(record) {
  const { event, phase, blockNumber } = record;
  const result = {};

  result.section = event.section;
  result.method = event.method;
  result.phase = phase.toString();
  result.data = JSON.stringify(event.data);
  result.amount = parseAmount(event);
  result._event = event;
  result._phase = phase;
  result.block_index = null;

  try {
    const phaseParsed = JSON.parse(result.phase);
    if (phaseParsed && phaseParsed.applyExtrinsic !== undefined) {
      result.block_index = `${blockNumber}-${phaseParsed.applyExtrinsic}`;
    }
  } catch {
    // Maybe we should do something with this error? But its't critical case.
  }
  return result;
}

module.exports = Object.freeze({
  get,
  parseRecord,
});
