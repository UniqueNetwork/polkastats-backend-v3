import { Column, Entity, Index } from 'typeorm';

@Index('harvester_error_pkey', ['blockNumber'], { unique: true })
@Entity('harvester_error', { schema: 'public' })
export class HarvesterError {
  @Column('bigint', { primary: true, name: 'block_number' })
  blockNumber: string;

  @Column('text', { name: 'error' })
  error: string;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
