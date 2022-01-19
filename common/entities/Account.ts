import { Column, Entity, Index } from 'typeorm';

@Index('account_pkey', ['accountId'], { unique: true })
@Entity('account', { schema: 'public' })
export class Account {
  @Column('text', { primary: true, name: 'account_id' })
  accountId: string;

  @Column('text', { name: 'balances' })
  balances: string;

  @Column('text', { name: 'available_balance', nullable: true })
  availableBalance: string | null;

  @Column('text', { name: 'free_balance' })
  freeBalance: string;

  @Column('text', { name: 'locked_balance' })
  lockedBalance: string;

  @Column('text', { name: 'nonce', nullable: true })
  nonce: string | null;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;

  @Column('bigint', { name: 'block_height' })
  blockHeight: string;

  @Column('boolean', { name: 'is_staking' })
  isStaking: boolean;
}
