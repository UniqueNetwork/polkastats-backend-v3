import { OpalAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/opalAPI';
import { TestnetAPI } from 'lib/providerAPI/bridgeProviderAPI/concreate/testnetAPI';
import { Sequelize } from 'sequelize/types';
import pino from 'pino';
import { BridgeAPI } from '../lib/providerAPI/bridgeApi';
import { getCollectionById } from '../lib/collectionData';
import collectionDB from '../lib/collectionDB';
import { ICrawlerModuleConstructorArgs } from './crawlers.interfaces';

const logger = pino({ name: 'collectionListener' });

async function getCollections(bridgeAPI, maxCollectionId) {
  const collections = [];
  const destroyedCollections: number[] = [];
  for (let collectionId = 1; collectionId <= maxCollectionId; collectionId++) {
    const collection = await getCollectionById(collectionId, bridgeAPI);
    if (collection) {
      collections.push(collection);
    } else {
      destroyedCollections.push(collectionId);
    }
  }
  return {
    collections,
    destroyedCollections,
  };
}

function saveCollections(collections: any[], sequelize: Sequelize) : Promise<any[]> {
  return Promise.all(collections.map((collection) => {
    logger.debug(`Save collection with id: ${collection?.collection_id}`);

    return collectionDB.save({
      collection,
      sequelize,
      excludeFields: ['date_of_creation'],
    });
  }));
}

function destroyCollections(collectionsIds: number[], sequelize: Sequelize) : Promise<any[]> {
  return Promise.all(collectionsIds.map((collectionId) => {
    logger.debug(`Remove collection with id: ${collectionId}`);

    return collectionDB.del(collectionId, sequelize);
  }));
}

async function runCollectionsListener(bridgeAPI: OpalAPI | TestnetAPI, sequelize: Sequelize) {
  const collectionsCount = await bridgeAPI.getCollectionCount();
  const { collections, destroyedCollections } = await getCollections(bridgeAPI, collectionsCount);

  await saveCollections(collections, sequelize);

  await destroyCollections(destroyedCollections, sequelize);

  logger.info(`Total count: ${collectionsCount}. Exist: ${collections.length}. Burned: ${destroyedCollections.length}`);
}

// eslint-disable-next-line import/prefer-default-export
export async function start({ api, sequelize, config }: ICrawlerModuleConstructorArgs) {
  const { pollingTime } = config;
  const { bridgeAPI } = new BridgeAPI(api);

  logger.info(`Starting collection crawler... Polling time are ${pollingTime / 1000} seconds.`);

  (async function run() {
    await runCollectionsListener(bridgeAPI, sequelize);
    setTimeout(() => run(), pollingTime);
  }());
}
