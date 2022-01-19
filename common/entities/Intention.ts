import { Column, Entity, Index } from 'typeorm';

@Index('intention_account_id_idx', ['accountId'], {})
@Index('intention_pkey', ['accountId', 'blockHeight', 'sessionIndex'], {
  unique: true,
})
@Entity('intention', { schema: 'public' })
export class Intention {
  @Column('bigint', { primary: true, name: 'block_height' })
  blockHeight: string;

  @Column('integer', { primary: true, name: 'session_index' })
  sessionIndex: number;

  @Column('text', { primary: true, name: 'account_id' })
  accountId: string;

  @Column('text', { name: 'controller_id' })
  controllerId: string;

  @Column('text', { name: 'stash_id' })
  stashId: string;

  @Column('integer', { name: 'rank' })
  rank: number;

  @Column('text', { name: 'stakers' })
  stakers: string;

  @Column('text', { name: 'identity' })
  identity: string;

  @Column('text', { name: 'display_name' })
  displayName: string;

  @Column('text', { name: 'nominators' })
  nominators: string;

  @Column('text', { name: 'reward_destination' })
  rewardDestination: string;

  @Column('text', { name: 'staking_ledger' })
  stakingLedger: string;

  @Column('text', { name: 'staking_ledger_total' })
  stakingLedgerTotal: string;

  @Column('text', { name: 'validator_prefs' })
  validatorPrefs: string;

  @Column('text', { name: 'commission' })
  commission: string;

  @Column('text', { name: 'next_session_ids' })
  nextSessionIds: string;

  @Column('text', { name: 'next_session_id_hex' })
  nextSessionIdHex: string;

  @Column('boolean', { name: 'next_elected' })
  nextElected: boolean;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
