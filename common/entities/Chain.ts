import { Column, Entity, Index } from 'typeorm';

@Index('chain_pkey', ['blockHeight'], { unique: true })
@Entity('chain', { schema: 'public' })
export class Chain {
  @Column('bigint', { primary: true, name: 'block_height' })
  blockHeight: string;

  @Column('integer', { name: 'session_index' })
  sessionIndex: number;

  @Column('text', { name: 'total_issuance' })
  totalIssuance: string;

  @Column('bigint', { name: 'active_accounts' })
  activeAccounts: string;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
