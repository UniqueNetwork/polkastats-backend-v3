import { ApiPromise } from '@polkadot/api';
import { Sdk } from '@unique-nft/sdk';
import { typeProvider } from '../../config/config';
import { TypeProvider } from './type/provider';
import { OpalAPI } from './bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from './bridgeProviderAPI/concreate/testnetAPI';
import { ImplementOpalAPI } from './bridgeProviderAPI/implement/implementOpalAPI';
import { ImplementTestnetAPI } from './bridgeProviderAPI/implement/implemnetTestnetAPI';

export class BridgeAPI {
  constructor(private api: ApiPromise, private sdk: Sdk) {}

  get bridgeAPI() {
    switch (typeProvider) {
      case TypeProvider.OPAL:
      case TypeProvider.QUARTZ:
      case TypeProvider.WESTEND:
        return new OpalAPI(new ImplementOpalAPI(this.api, this.sdk));
      default:
        return new TestnetAPI(new ImplementTestnetAPI(this.api, this.sdk));
    }
  }
}
