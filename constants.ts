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
