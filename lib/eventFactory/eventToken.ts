import { Sequelize, Transaction } from 'sequelize/types';
import { getFormattedToken } from 'lib/token/tokenData';
import protobuf from '../../utils/protobuf';
import { OpalAPI } from '../providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from '../providerAPI/bridgeProviderAPI/concreate/testnetAPI';
import { save as saveCollectionDb, getCollectionSchemaInfo } from '../collection/collectionDB';
import eventsDB from '../eventsDB';
import { EventTypes } from './type';
import { getFormattedCollectionById } from '../collection/collectionData';
import { ICollectionSchemaInfo } from '../../crawlers/crawlers.interfaces';

export class EventToken {
  constructor(
    protected bridgeAPI: OpalAPI | TestnetAPI,
    protected sequelize: Sequelize,
    public collectionId: number,
    public tokenId: number,
    public timestamp: number,
  ) {
    if (!this.collectionId || !this.tokenId) {
      throw new Error(`Can't create/modify token without collectionId(${this.collectionId}) or tokenId(${this.tokenId})`);
    }
  }

  public async save(transaction: Transaction): Promise<void> {}

  public async getToken(): Promise<any> {
    const tokenSchema = await this.getTokenSchema();
    const token = await getFormattedToken(this.tokenId, tokenSchema, this.bridgeAPI);
    return token;
  }

  private parseConstData(constData, schema) {
    const buffer = Buffer.from(constData.replace('0x', ''), 'hex');
    if (buffer.toString().length !== 0 && constData.replace('0x', '') && schema !== null) {
      return {
        constData,
        buffer,
        locale: 'en',
        root: schema,
      };
    }

    return { constData };
  }

  private getDeserializeConstData(statement) {
    const result = {};
    if ('buffer' in statement) {
      try {
        return protobuf.deserializeNFT(statement);
      } catch (error) {
        console.error(error);
        return {
          hex: statement.constData?.toString().replace('0x', '') || statement.constData,
        };
      }
    }

    return result;
  }

  private getConstData(constData, schema) {
    const statement = this.parseConstData(constData, schema);
    return JSON.stringify(this.getDeserializeConstData(statement));
  }

  private async getTokenSchema(): Promise<ICollectionSchemaInfo | null> {
    const collectionSchema = await getCollectionSchemaInfo({
      collectionId: this.collectionId,
      sequelize: this.sequelize,
    });

    if (collectionSchema.length) {
      return collectionSchema[0];
    }

    // Collection is not in db, try to import
    // todo: Do something more centralized
    const collection = await getFormattedCollectionById(this.collectionId, this.bridgeAPI);
    if (collection) {
      await saveCollectionDb({
        collection,
        sequelize: this.sequelize,
        excludeFields: ['date_of_creation'],
      });

      return {
        collectionId: this.collectionId,
        schema: protobuf.getProtoBufRoot(collection.const_chain_schema),
      };
    }

    return null;
  }

  protected async canSave(): Promise<boolean> {
    const destroyTokenEvent = await eventsDB.getTokenEvent(
      this.sequelize,
      this.collectionId,
      this.tokenId,
      EventTypes.TYPE_ITEM_DESTROYED,
    );

    const destroyCollectionEvent = await eventsDB.getCollectionEvent(
      this.sequelize,
      this.collectionId,
      EventTypes.TYPE_COLLECTION_DESTROYED,
    );

    return !destroyTokenEvent && !destroyCollectionEvent;
  }
}
