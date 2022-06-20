const pino = require('pino');
const { QueryTypes } = require('sequelize');

const logger = pino({ name: 'SystemCrawler', level: process.env.PINO_LOG_LEVEL || 'info' });

function insertRow(sequelize, blockHeight, chain, nodeName, nodeVersion) {
  logger.info({
    blockHeight, chain, nodeName, nodeVersion,
  }, 'Write new system record');

  return sequelize.query(
    `INSERT INTO system (block_height, chain, node_name, node_version, timestamp
    ) VALUES (:blockHeight, :chain, :nodeName, :nodeVersion, :timestamp)`,
    {
      type: QueryTypes.INSERT,
      plain: true,
      replacements: {
        blockHeight,
        chain,
        nodeName,
        nodeVersion,
        timestamp: new Date().getTime(),
      },
    },
  );
}

async function start({ api, sequelize }) {
  logger.info('Starting crawler');

  const rawData = await Promise.all([
    api.derive.chain.bestNumber(),
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  const [blockHeight, chain, nodeName, nodeVersion] = rawData.map((r) => r.toString());

  const isSameNodeAndState = await sequelize.query(
    `
    select * from (
      SELECT chain, node_name, node_version, block_height FROM system ORDER by block_height DESC LIMIT 1
    ) as lastSystemRun
    where 
      chain = :chain and 
      node_name = :nodeName and
      node_version = :nodeVersion and
      block_height = :blockHeight
    `,
    {
      type: QueryTypes.SELECT,
      logging: false,
      plain: true,
      replacements: {
        blockHeight,
        chain,
        nodeName,
        nodeVersion,
      },
    },
  );

  if (!isSameNodeAndState) {
    await insertRow(sequelize, blockHeight, chain, nodeName, nodeVersion);
  }
}

module.exports = { start };
