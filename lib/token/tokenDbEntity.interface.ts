export interface ITokenDbEntity {
  // id: number,
  token_id: number,
  collection_id: number,
  owner: string,
  owner_normalized: string,
  data: Object,
  date_of_creation?: number,
  properties: string,
  attributes: string,
  parent_id: string | null
}
