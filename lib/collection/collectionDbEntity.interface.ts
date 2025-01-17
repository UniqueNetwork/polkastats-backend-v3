export type ICollectionDbEntityFieldsetLimits = {
  token_limit: number,
  limits_account_ownership?: number,
  limits_sponsore_data_size?: number,
  limits_sponsore_data_rate?: number,
  owner_can_transfer: boolean,
  owner_can_destroy: boolean
};

export type ICollectionDbEntityFieldsetSchema = {
  offchain_schema?: string,
  const_chain_schema?: Object,
  variable_on_chain_schema?: { collectionCover?: string },
  schema_version?: string
};

export interface ICollectionDbEntity extends ICollectionDbEntityFieldsetLimits, ICollectionDbEntityFieldsetSchema {
  collection_id: number,
  owner: string,
  owner_normalized: string,
  name?: string,
  description?: string,
  token_prefix?: string,
  sponsorship?: string,
  mode?: string,
  mint_mode?: boolean,

  properties: string | null,
  permissions: Object | null,
  token_property_permissions: Object | null,

  date_of_creation?: number,
  collection_cover?: string,

  attributes_schema: string | null
}
