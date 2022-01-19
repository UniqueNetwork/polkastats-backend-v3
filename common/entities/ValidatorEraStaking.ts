import { Column, Entity, Index } from 'typeorm';

@Index('validator_era_staking_pkey', ['eraIndex', 'eraPoints'], {
  unique: true,
})
@Entity('validator_era_staking', { schema: 'public' })
export class ValidatorEraStaking {
  @Column('integer', { primary: true, name: 'era_index' })
  eraIndex: number;

  @Column('text', { name: 'stash_id', nullable: true })
  stashId: string | null;

  @Column('text', { name: 'identity' })
  identity: string;

  @Column('text', { name: 'display_name' })
  displayName: string;

  @Column('bigint', { name: 'commission', nullable: true })
  commission: string | null;

  @Column('text', { name: 'era_rewards', nullable: true })
  eraRewards: string | null;

  @Column('integer', { primary: true, name: 'era_points' })
  eraPoints: number;

  @Column('text', { name: 'stake_info', nullable: true })
  stakeInfo: string | null;

  @Column('bigint', { name: 'estimated_payout' })
  estimatedPayout: string;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
