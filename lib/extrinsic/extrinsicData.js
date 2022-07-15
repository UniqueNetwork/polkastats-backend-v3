function get({
  blockNumber,
  extrinsic,
  index,
  success,
  amount,
  fee,
  timestamp,
}) {
  function getSigned() {
    const { isSigned } = extrinsic;
    return {
      is_signed: isSigned,
      signer: isSigned ? extrinsic.signer.toString() : null,
    };
  }

  function getMethod() {
    const {
      method: { section, method },
    } = extrinsic.toHuman();
    return { section, method };
  }

  const prepareData = {};
  prepareData.block_number = blockNumber;
  prepareData.extrinsic_index = index;
  prepareData.args = JSON.stringify(extrinsic.args);
  prepareData.hash = extrinsic.hash.toHex();
  prepareData.success = success;
  prepareData.amount = amount || null;
  prepareData.fee = fee || null;
  prepareData.timestamp = Math.floor(timestamp / 1000);
  prepareData.block_index = `${blockNumber}-${index}`;
  prepareData.to_owner = null;

  const result = Object.assign(prepareData, getSigned(), getMethod());

  if (
    ['transfer', 'transferAll', 'transferKeepAlive', 'vestedTransfer'].includes(
      result.method,
    )
  ) {
    const args = JSON.parse(prepareData.args);
    const ownerData = args[0];
    if (ownerData) {
      prepareData.to_owner = ownerData.id || ownerData.substrate || ownerData.ethereum || null;
    }
  }

  return result;
}

module.exports = Object.freeze({
  get,
});
