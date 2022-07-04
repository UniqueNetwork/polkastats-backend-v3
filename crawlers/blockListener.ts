import { Logger, pino } from 'pino';
import { ApiPromise } from '@polkadot/api';
import { Sequelize, Transaction } from 'sequelize/types';
import { OpalAPI } from '../lib/providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from '../lib/providerAPI/bridgeProviderAPI/concreate/testnetAPI';
import { BridgeAPI } from '../lib/providerAPI/bridgeApi';
import extrinsic from '../lib/extrinsic/extrinsics';
import eventsDB from '../lib/events/eventsDB';
import blockDB from '../lib/block/blockDB';
import { get as getBlockData } from '../lib/block/blockData';
import {
  get as getEventsData,
  parseRecord as parseEventRecord,
} from '../lib/events/eventsData';
import { EventFacade } from './eventFacade';
import { ICrawlerModuleConstructorArgs } from './crawlers.interfaces';
import { EventSection } from '../constants';

const loggerOptions = {
  name: 'BlockListener',
  level: process.env.PINO_LOG_LEVEL || 'info',
};

export class BlockListener {
  protected logger: Logger;

  protected bridgeApi: OpalAPI | TestnetAPI;

  private eventFacade: EventFacade;

  constructor(protected api: ApiPromise, protected sequelize: Sequelize) {
    this.logger = pino(loggerOptions);
    this.bridgeApi = new BridgeAPI(api).bridgeAPI;
    this.eventFacade = new EventFacade(this.bridgeApi, this.sequelize);
  }

  async startBlockListening(): Promise<void> {
    this.logger.info('Crawler started');
    await this.bridgeApi.api.rpc.chain.subscribeNewHeads(async (header) => {
      const blockNumber = header.number.toNumber();
      this.logger.debug(
        `New block received #${blockNumber} has hash ${header.hash}`,
      );
      await this.blockProcessing(blockNumber);
    });
  }

  async blockProcessing(blockNumber: number): Promise<void> {
    const blockData = await this.getBlockData(blockNumber);

    const events = await getEventsData({
      bridgeAPI: this.bridgeApi,
      blockHash: blockData.blockHash,
    });

    const timestamp = blockData.timestamp
      ? Math.floor(blockData.timestamp / 1000)
      : 0;
    const sessionLength = (
      this.bridgeApi.api.consts?.babe?.epochDuration || 0
    ).toString();

    const transaction = await this.sequelize.transaction();
    try {
      await blockDB.save({
        blockNumber,
        block: Object.assign(blockData, events, { timestamp, sessionLength }),
        sequelize: this.sequelize,
        transaction,
      });

      const parsedEvents = await this.saveEvents(
        events,
        blockNumber,
        timestamp,
        transaction,
      );

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
    } catch (e) {
      this.logger.error(e);
      await transaction.rollback();
    }
  }

  async saveEvents(
    events: any,
    blockNumber: number,
    timestamp: number,
    transaction: Transaction
  ): Promise<Object[]> {
    const parsedEvents = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [eventIndex, event] of events.blockEvents.entries()) {
      const preEvent = {
        blockNumber,
        timestamp,
        eventIndex,
        ...parseEventRecord({ ...event, blockNumber }),
      };

      const { section, method, amount, extrinsicIndex } = preEvent;

      parsedEvents.push({
        blockNumber,
        extrinsicIndex,
        section,
        method,
        amount,
      });

      // eslint-disable-next-line no-await-in-loop
      await eventsDB.save({
        event: preEvent,
        sequelize: this.sequelize,
        transaction,
      });

      this.logger.info(
        `Added event #${blockNumber}-${eventIndex} ${section} ➡ ${method}`
      );

      if (section !== EventSection.BALANCES) {
        // eslint-disable-next-line no-await-in-loop
        await this.eventFacade.save({
          type: method,
          data: preEvent.rawEvent.data.toJSON(),
          timestamp,
          transaction,
        });
      }
    }

    return parsedEvents;
  }

  private async getBlockData(blockNumber: number) {
    return getBlockData({
      blockNumber,
      bridgeAPI: this.bridgeApi,
    });
  }
}

export async function start({ api, sequelize }: ICrawlerModuleConstructorArgs) {
  const blockListener = new BlockListener(api, sequelize);
  await blockListener.startBlockListening();
}
