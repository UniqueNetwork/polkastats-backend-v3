import 'dotenv/config';

import { TypeProvider } from '../lib/providerAPI/type/provider';

function getConnect() {
  const user = process.env.POSTGRES_USER || 'polkastats';
  const password = process.env.POSTGRES_PASSWORD || 'polkastats';
  const database = process.env.POSTGRES_DATABASE || 'polkastats';
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = process.env.POSTGRES_PORT || 5432;
  return `postgres://${user}:${password}@${host}:${port}/${database}`;
}

export const dbConnect = getConnect();

export const substrateNetwork = process.env.SUBSTRATE_NETWORK || 'polkadot';
export const wsProviderUrl = process.env.WS_PROVIDER_URL || 'wss://testnet2.uniquenetwork.io';
export const typeProvider: TypeProvider = process.env.TYPE_PROVIDER
  ? TypeProvider[process.env.TYPE_PROVIDER.toUpperCase()]
  : TypeProvider.TESTNET2;

export const prometheusPort = process.env.PROMETHEUS_PORT || 9003;

export const firstBlock = process.env.FIRST_BLOCK || 0;

export const DEFAULT_POLLING_TIME_MS = 60 * 60 * 1000;
export const ACTIVE_ACCOUNTS_DEFAULT_POLLING_TIME_MS = 1 * 60 * 1000;
export const DEFAULT_COUNT_OF_PARALLEL_TASKS = 50;

export const IPFS_URL = process.env.IPFS_URL || 'https://ipfs.unique.network/ipfs/';
