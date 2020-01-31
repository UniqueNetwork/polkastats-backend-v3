module.exports = {
  // Enable CORS
  enableCORS: true,
  // Backend port
  backendPort: 8443,
  // Local Polkadot Kusama node
  wsProviderUrl: 'ws://127.0.0.1:9944',
  // Postgres database connection params
  postgresConnParams: {
    user: 'polkastats',
    host: 'localhost',
    database: 'polkastats',
    password: 'polkastats',
    port: 3211,
  },
}