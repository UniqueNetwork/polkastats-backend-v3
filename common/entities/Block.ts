import { Column, Entity, Index } from 'typeorm';

@Index('block_pkey', ['blockNumber'], { unique: true })
@Entity('block', { schema: 'public' })
export class Block {
  @Column('bigint', { primary: true, name: 'block_number' })
  blockNumber: string;

  @Column('bigint', { name: 'block_number_finalized' })
  blockNumberFinalized: string;

  @Column('text', { name: 'block_author', nullable: true })
  blockAuthor: string | null;

  @Column('text', { name: 'block_author_name', nullable: true })
  blockAuthorName: string | null;

  @Column('text', { name: 'block_hash' })
  blockHash: string;

  @Column('text', { name: 'parent_hash' })
  parentHash: string;

  @Column('text', { name: 'extrinsics_root' })
  extrinsicsRoot: string;

  @Column('text', { name: 'state_root', nullable: true })
  stateRoot: string | null;

  @Column('bigint', { name: 'current_era', nullable: true })
  currentEra: string | null;

  @Column('bigint', { name: 'current_index', nullable: true })
  currentIndex: string | null;

  @Column('bigint', { name: 'era_length', nullable: true })
  eraLength: string | null;

  @Column('bigint', { name: 'era_progress', nullable: true })
  eraProgress: string | null;

  @Column('boolean', { name: 'is_epoch', nullable: true })
  isEpoch: boolean | null;

  @Column('boolean', { name: 'is_election' })
  isElection: boolean;

  @Column('bigint', { name: 'session_length', nullable: true })
  sessionLength: string | null;

  @Column('integer', { name: 'session_per_era', nullable: true })
  sessionPerEra: number | null;

  @Column('bigint', { name: 'session_progress', nullable: true })
  sessionProgress: string | null;

  @Column('integer', { name: 'validator_count' })
  validatorCount: number;

  @Column('text', { name: 'spec_name' })
  specName: string;

  @Column('integer', { name: 'spec_version' })
  specVersion: number;

  @Column('integer', { name: 'total_events' })
  totalEvents: number;

  @Column('integer', { name: 'num_transfers' })
  numTransfers: number;

  @Column('integer', { name: 'new_accounts' })
  newAccounts: number;

  @Column('text', { name: 'total_issuance' })
  totalIssuance: string;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
