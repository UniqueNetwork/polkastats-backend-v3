import { Column, Entity, Index } from 'typeorm';

@Index('validator_pkey', ['accountId', 'blockHeight', 'sessionIndex'], {
  unique: true,
})
@Index('validator_account_id_idx', ['accountId'], {})
@Entity('validator', { schema: 'public' })
export class Validator {
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

  @Column('text', { name: 'exposure' })
  exposure: string;

  @Column('text', { name: 'exposure_total' })
  exposureTotal: string;

  @Column('text', { name: 'exposure_own' })
  exposureOwn: string;

  @Column('text', { name: 'exposure_others' })
  exposureOthers: string;

  @Column('text', { name: 'nominators' })
  nominators: string;

  @Column('text', { name: 'reward_destination' })
  rewardDestination: string;

  @Column('text', { name: 'staking_ledger' })
  stakingLedger: string;

  @Column('text', { name: 'validator_prefs' })
  validatorPrefs: string;

  @Column('text', { name: 'commission' })
  commission: string;

  @Column('text', { name: 'session_ids' })
  sessionIds: string;

  @Column('text', { name: 'next_session_ids' })
  nextSessionIds: string;

  @Column('text', { name: 'session_id_hex' })
  sessionIdHex: string;

  @Column('text', { name: 'next_session_id_hex' })
  nextSessionIdHex: string;

  @Column('text', { name: 'redeemable' })
  redeemable: string;

  @Column('boolean', { name: 'next_elected' })
  nextElected: boolean;

  @Column('integer', { name: 'produced_blocks' })
  producedBlocks: number;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
