const { EventSection, EventMethod, EventPhase } = require('../../constants');
const { getAmount } = require('../../utils/utils');

async function get({
  bridgeAPI,
  blockHash,
}) {
  const result = {};

  const blockEvents = await bridgeAPI.api.query.system.events.at(blockHash);

  result.blockEvents = blockEvents;

  result.numTransfers = blockEvents.filter(
    (record) => record.event.section === EventSection.BALANCES
      && record.event.method === EventMethod.TRANSFER,
  ).length || 0;

  result.newAccounts = blockEvents.filter(
    (record) => record.event.section === EventSection.BALANCES
      && record.event.method === EventMethod.ENDOWED,
  ).length || 0;

  return result;
}

function parseAmount(event) {
  const {
    phase, method, data, section,
  } = event;

  let result = '0';
  let amountIndex = null;

  /*
   * Extract amount value from event data.
   * The index of amount value depends on the event section and method values.
   * See: https://polkadot.js.org/docs/substrate/events
   *
   * todo: Need to get amount values from all the events that can have ammount values.
   */
  if (phase !== EventPhase.INITIALIZATION
     && [EventMethod.TRANSFER, EventMethod.DEPOSIT, EventMethod.WITHDRAW].includes(method)) {
    if (section === EventSection.BALANCES) {
      amountIndex = method === EventMethod.DEPOSIT || method === EventMethod.WITHDRAW ? 1 : 2;
    } else if (section === EventSection.TREASURY) {
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
  result.rawEvent = event;
  result.extrinsicIndex = null;
  result.blockIndex = null;

  try {
    const phaseParsed = JSON.parse(result.phase);
    if (phaseParsed && phaseParsed.applyExtrinsic !== undefined) {
      result.extrinsicIndex = phaseParsed.applyExtrinsic;
      result.blockIndex = `${blockNumber}-${phaseParsed.applyExtrinsic}`;
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
