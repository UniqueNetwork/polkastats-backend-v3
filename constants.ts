export enum SchemaVersion {
  IMAGE_URL = 'ImageUrl',
  UNIQUE = 'Unique',
}

export enum EventPhase {
  INITIALIZATION = 'Initialization',
}

export enum EventMethod {
  TRANSFER = 'Transfer',
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
  ENDOWED = 'Endowed',
  EXTRINSIC_SUCCESS = 'ExtrinsicSuccess',
}

export enum EventSection {
  SYSTEM = 'system',
  BALANCES = 'balances',
  TREASURY = 'treasury',
}

export const NESTING_ADDRESS_PREFIX = '0xf8238ccfff8ed887463fd5e0';

export const NESTING_ADDRESS_LENGTH = 42;
