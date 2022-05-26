// eslint-disable-next-line import/no-extraneous-dependencies
const { encodeAddress, decodeAddress } = require('@polkadot/util-crypto');
const BigNumber = require('bignumber.js');
const { EventSection, EventMethod } = require('../constants');

const ETHEREUM_ADDRESS_MAX_LENGTH = 42;

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function shortHash(hash) {
  return `${hash.substr(0, 6)}…${hash.substr(hash.length - 5, 4)}`;
}

async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getExtrinsicSuccess(extrinsicParsedEvents) {
  // assume success if no events were extracted
  if (extrinsicParsedEvents.length === 0) {
    return true;
  }

  let extrinsicSuccess = false;
  extrinsicParsedEvents.forEach((event) => {
    const { section, method } = event;
    if (section === EventSection.SYSTEM && method === EventMethod.EXTRINSIC_SUCCESS
    ) {
      extrinsicSuccess = true;
    }
  });
  return extrinsicSuccess;
}

function getExtrinsicAmount(extrinsicParsedEvents) {
  return extrinsicParsedEvents
    .filter(({ section, method }) => section === EventSection.BALANCES && method === EventMethod.TRANSFER)
    .reduce((sum, { amount }) => {
      const am = parseFloat(amount) || 0;
      return sum + am;
    }, 0);
}

function getExtrinsicFee(extrinsicParsedEvents) {
  return extrinsicParsedEvents
    .filter(({ section, method }) => section === EventSection.TREASURY && method === EventMethod.DEPOSIT)
    .reduce((sum, { amount }) => {
      const am = parseFloat(amount) || 0;
      return sum + am;
    }, 0);
}

function getBuffer(aValue) {
  return Buffer.from(aValue, 'hex').toString('utf-8');
}

function avoidUseBuffer(buf) {
  let str = '';
  for (let i = 0, strLen = buf.length; i < strLen; i++) {
    if (buf[i] !== 0) {
      str += String.fromCharCode(buf[i]);
    } else {
      break;
    }
  }
  return str;
}

function parseHexToString(value) {
  try {
    const source = value.toString().replace('0x', '');
    return getBuffer(source);
  } catch (error) {
    return '';
  }
}

function bufferToString(value) {
  try {
    if (value.length === 0 || value.length <= 3) {
      return '';
    }
    if (value.join('').includes('123')) {
      return '';
    }
    return getBuffer(value);
  } catch (error) {
    return '';
  }
}

function genArrayRange(min, max) {
  return Array.from(
    { length: max - min },
    (_, i) => i + ((min === 0 ? -1 : min - 1) + 1),
  );
}

/**
 * Convert buffer to JSON object
 * @param {string} value
 * @returns
 */
function bufferToJSON(value) {
  try {
    const data = parseHexToString(value);
    const result = null;
    if (data === '') {
      return result;
    }
    return (typeof JSON.parse(data) === 'object') ? data : null;
  } catch (err) {
    return null;
  }
}

function getAmount(strNum) {
  BigNumber.config({
    EXPONENTIAL_AT: [-30, 30],
  });

  const result = BigNumber(strNum);
  const dividedBy = result.dividedBy('1000000000000000000').toString();
  return dividedBy;
}

function normalizeSubstrateAddress(address) {
  if (address?.length <= ETHEREUM_ADDRESS_MAX_LENGTH) {
    return address;
  }

  return encodeAddress(decodeAddress(address));
}

module.exports = {
  formatNumber,
  shortHash,
  wait,
  genArrayRange,
  bufferToString,
  parseHexToString,
  avoidUseBuffer,
  getExtrinsicSuccess,
  getExtrinsicAmount,
  getExtrinsicFee,
  bufferToJSON,
  getAmount,
  normalizeSubstrateAddress,
};
