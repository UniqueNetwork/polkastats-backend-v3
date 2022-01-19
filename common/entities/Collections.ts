import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Tokens } from './Tokens';

@Index('collections_pkey', ['collectionId'], { unique: true })
@Entity('collections', { schema: 'public' })
export class Collections {
  @Column('bigint', { primary: true, name: 'collection_id' })
  collectionId: string;

  @Column('text', { name: 'owner' })
  owner: string;

  @Column('text', { name: 'name', nullable: true })
  name: string | null;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('text', { name: 'offchain_schema', nullable: true })
  offchainSchema: string | null;

  @Column('bigint', { name: 'token_limit' })
  tokenLimit: string;

  @Column('jsonb', { name: 'const_chain_schema', nullable: true, default: {} })
  constChainSchema: object | null;

  @Column('jsonb', {
    name: 'variable_on_chain_schema',
    nullable: true,
    default: {},
  })
  variableOnChainSchema: object | null;

  @Column('bigint', { name: 'limits_accout_ownership', nullable: true })
  limitsAccoutOwnership: string | null;

  @Column('integer', { name: 'limits_sponsore_data_size', nullable: true })
  limitsSponsoreDataSize: number | null;

  @Column('integer', { name: 'limits_sponsore_data_rate', nullable: true })
  limitsSponsoreDataRate: number | null;

  @Column('boolean', { name: 'owner_can_trasfer', nullable: true })
  ownerCanTrasfer: boolean | null;

  @Column('boolean', { name: 'owner_can_destroy', nullable: true })
  ownerCanDestroy: boolean | null;

  @Column('character varying', {
    name: 'sponsorship_confirmed',
    nullable: true,
    length: 255,
  })
  sponsorshipConfirmed: string | null;

  @Column('character varying', {
    name: 'schema_version',
    nullable: true,
    length: 255,
  })
  schemaVersion: string | null;

  @Column('character varying', {
    name: 'token_prefix',
    nullable: true,
    length: 255,
  })
  tokenPrefix: string | null;

  @Column('character varying', { name: 'mode', nullable: true, length: 255 })
  mode: string | null;

  @OneToMany(() => Tokens, (tokens) => tokens.collection)
  tokens: Tokens[];
}
