import { Logger, pino } from 'pino';
import { ApiPromise } from '@polkadot/api';
import { Sequelize, Transaction } from 'sequelize/types';
import { OpalAPI } from '../lib/providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from '../lib/providerAPI/bridgeProviderAPI/concreate/testnetAPI';
import { BridgeAPI } from '../lib/providerAPI/bridgeApi';
import extrinsic from '../lib/extrinsics';
import eventsDB from '../lib/eventsDB';
import blockDB from '../lib/blockDB';
import { get as getBlockData } from '../lib/blockData';
import { get as getEventsData, parseRecord as parseEventRecord } from '../lib/eventsData';
import { EventFacade } from './eventFacade';
import { ICrawlerModuleConstructorArgs } from './crawlers.interfaces';
import { EVENT_SECTION } from '../constants';

const loggerOptions = {
  crawler: 'blockListener',
};

export class BlockListener {
  protected logger: Logger;

  protected bridgeApi: OpalAPI | TestnetAPI;

  private eventFacade: EventFacade;

  constructor(
    protected api: ApiPromise,
    protected sequelize: Sequelize,
  ) {
    this.logger = pino({ name: this.constructor.name });
    this.bridgeApi = new BridgeAPI(api).bridgeAPI;
    this.eventFacade = new EventFacade(this.bridgeApi, this.sequelize);
  }

  async startBlockListening(): Promise<void> {
    this.logger.info('Block listening was started');
    await this.bridgeApi.api.rpc.chain.subscribeNewHeads(async (header) => {
      const blockNumber = header.number.toNumber();
      this.logger.debug(`New block received #${blockNumber} has hash ${header.hash}`);
      await this.blockProcessing(blockNumber);
    });
  }

  async blockProcessing(blockNumber: number): Promise<void> {
    const blockData = await this._getBlockData(blockNumber);

    const events = await getEventsData({
      bridgeAPI: this.bridgeApi,
      blockHash: blockData.blockHash,
    });

    const timestamp = blockData.timestamp ? Math.floor(blockData.timestamp / 1000) : 0;
    const sessionLength = (this.bridgeApi.api.consts?.babe?.epochDuration || 0).toString();

    const transaction = await this.sequelize.transaction();
    try {
      await blockDB.save({
        blockNumber,
        block: Object.assign(blockData, events, { timestamp, sessionLength }),
        sequelize: this.sequelize,
        transaction,
      });

      const parsedEvents = await this.saveEvents(events, blockNumber, timestamp, transaction);

      await extrinsic.save({
        sequelize: this.sequelize,
        blockNumber,
        extrinsics: blockData.extrinsics,
        parsedEvents,
        timestampMs: timestamp * 1000,
        loggerOptions,
        transaction,
      });

      await transaction.commit();

      process.exit(0);
    } catch (e) {
      this.logger.error(e);
      await transaction.rollback();
    }
  }

  async saveEvents(
    events: any,
    blockNumber: number,
    timestamp: number,
    transaction: Transaction,
  ): Promise<Object[]> {
    const parsedEvents = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [index, event] of events.blockEvents.entries()) {
      const preEvent = {
        block_number: blockNumber,
        event_index: index,
        timestamp,
        ...parseEventRecord({ ...event, blockNumber }),
      };

      const extrinsicIndex = parseInt(event.phase.toHuman().ApplyExtrinsic);
      const {
        section,
        method,
        amount,
      } = preEvent;

      parsedEvents.push({
        blockNumber,
        extrinsicIndex,
        section,
        method,
        amount,
      });

      // eslint-disable-next-line no-await-in-loop
      await eventsDB.save({ event: preEvent, sequelize: this.sequelize, transaction });

      this.logger.info(
        `Added event #${blockNumber}-${index} ${preEvent.section} ➡ ${preEvent.method}`,
      );

      if (preEvent.section !== EVENT_SECTION.BALANCES) {
        // eslint-disable-next-line no-await-in-loop
        await this.eventFacade.save({
          type: preEvent.method,
          data: preEvent._event.data.toJSON(),
          timestamp: preEvent.timestamp,
          transaction,
        });
      }
    }

    return parsedEvents;
  }

  async _getBlockData(blockNumber: number) {
    return getBlockData({
      blockNumber,
      bridgeAPI: this.bridgeApi,
    });
  }
}

export async function start({ api, sequelize }: ICrawlerModuleConstructorArgs) {
  const blockListener = new BlockListener(api, sequelize);
  // await blockListener.startBlockListening();
  await blockListener.blockProcessing(
    857962,
    // 135061,
  );
}
