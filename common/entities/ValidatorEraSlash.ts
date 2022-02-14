import { Column, Entity, Index } from 'typeorm';

@Index('validator_era_slash_pkey', ['eraIndex', 'stashId'], { unique: true })
@Entity('validator_era_slash', { schema: 'public' })
export class ValidatorEraSlash {
  @Column('integer', { primary: true, name: 'era_index' })
  era_index: number;

  @Column('text', { primary: true, name: 'stash_id' })
  stash_id: string;

  @Column('bigint', { name: 'amount' })
  amount: string;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
