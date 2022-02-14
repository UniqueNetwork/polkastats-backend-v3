import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Tokens } from './Tokens';

@Index('collections_pkey', ['collectionId'], { unique: true })
@Entity('collections', { schema: 'public' })
export class Collections {
  @Column('bigint', { primary: true, name: 'collection_id' })
  collection_id: string;

  @Column('text', { name: 'owner' })
  owner: string;

  @Column('text', { name: 'name', nullable: true })
  name: string | null;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('text', { name: 'offchain_schema', nullable: true })
  offchain_schema: string | null;

  @Column('bigint', { name: 'token_limit' })
  token_limit: string;

  @Column('jsonb', { name: 'const_chain_schema', nullable: true, default: {} })
  const_chain_schema: object | null;

  @Column('jsonb', {
    name: 'variable_on_chain_schema',
    nullable: true,
    default: {},
  })
  variable_on_chain_schema: object | null;

  @Column('bigint', { name: 'limits_accout_ownership', nullable: true })
  limits_accout_ownership: string | null;

  @Column('integer', { name: 'limits_sponsore_data_size', nullable: true })
  limits_sponsore_data_size: number | null;

  @Column('integer', { name: 'limits_sponsore_data_rate', nullable: true })
  limits_sponsore_data_rate: number | null;

  @Column('boolean', { name: 'owner_can_trasfer', nullable: true })
  owner_can_trasfer: boolean | null;

  @Column('boolean', { name: 'owner_can_destroy', nullable: true })
  owner_can_destroy: boolean | null;

  @Column('character varying', {
    name: 'sponsorship_confirmed',
    nullable: true,
    length: 255,
  })
  sponsorship_confirmed: string | null;

  @Column('character varying', {
    name: 'schema_version',
    nullable: true,
    length: 255,
  })
  schema_version: string | null;

  @Column('character varying', {
    name: 'token_prefix',
    nullable: true,
    length: 255,
  })
  token_prefix: string | null;

  @Column('character varying', { name: 'mode', nullable: true, length: 255 })
  mode: string | null;

  @OneToMany(() => Tokens, (tokens) => tokens.collection)
  tokens: Tokens[];
}