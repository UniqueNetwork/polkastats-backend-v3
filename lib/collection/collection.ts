export type ICollectionDBFieldsLimit = {
  token_limit: number,
  limits_account_ownership: number,
  limits_sponsore_data_size: number,
  limits_sponsore_data_rate: number,
  owner_can_transfer: boolean,
  owner_can_destroy: boolean
};

export type ICollectionDBFieldsSchema = {
  offchain_schema: String,
  const_chain_schema: Object,
  variable_on_chain_schema: Object,
  schema_version: String
};

export interface ICollectionDB extends ICollectionDBFieldsLimit, ICollectionDBFieldsSchema {
  collection_id: number,
  owner: string,
  name: string,
  description: string,
  token_prefix: string,
  sponsorship: string | null,
  mode: string,
  mint_mode: boolean,

  properties: Object | null,
  permissions: Object | null,
  token_property_permissions: Object | null,

  // date_of_creation: number
  // owner_normalized: text
  // collection_cover: string

  // ICollectionDBFieldsLimit
  //   token_limit: number
  //   limits_account_ownership: number
  //   limits_sponsore_data_size: number
  //   limits_sponsore_data_rate: number
  //   owner_can_transfer: boolean
  //   owner_can_destroy: boolean

  // ICollectionDBFieldsSchema
  //   offchain_schema: string
  //   const_chain_schema: Object
  //   variable_on_chain_schema: Object
  //   schema_version: string

}
