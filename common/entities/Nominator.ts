import { Column, Entity, Index } from 'typeorm';

@Index('nominator_pkey', ['accountId', 'blockHeight', 'sessionIndex'], {
  unique: true,
})
@Entity('nominator', { schema: 'public' })
export class Nominator {
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

  @Column('bigint', { name: 'total_staked' })
  totalStaked: string;

  @Column('text', { name: 'identity' })
  identity: string;

  @Column('text', { name: 'display_name' })
  displayName: string;

  @Column('text', { name: 'balances' })
  balances: string;

  @Column('bigint', { name: 'available_balance' })
  availableBalance: string;

  @Column('bigint', { name: 'free_balance' })
  freeBalance: string;

  @Column('bigint', { name: 'locked_balance' })
  lockedBalance: string;

  @Column('bigint', { name: 'nonce' })
  nonce: string;

  @Column('text', { name: 'targets' })
  targets: string;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
