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
    const result = {};
    result.is_signed = isSigned;
    result.signer = isSigned ? extrinsic.signer.toString() : null;
    return result;
  }

  function getMethod() {
    const { method } = extrinsic.toHuman();
    const result = {};
    result.section = method.section;
    result.method = method.method;
    return result;
  }

  const prepareData = {};
  prepareData.block_number = blockNumber;
  prepareData.extrinsic_index = index;
  prepareData.args = JSON.stringify(extrinsic.args);
  prepareData.hash = extrinsic.hash.toHex();
  prepareData.doc = extrinsic.meta.docs.toString().replace(/'/g, "''");
  prepareData.success = success;
  prepareData.amount = amount || null;
  prepareData.fee = fee || null;
  prepareData.timestamp = Math.floor(timestamp / 1000);
  prepareData.block_index = `${blockNumber}-${index}`;
  prepareData.to_owner = null;

  const result = Object.assign(
    prepareData,
    getSigned(),
    getMethod(),
  );

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
