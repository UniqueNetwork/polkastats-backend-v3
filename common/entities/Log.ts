import { Column, Entity, Index } from 'typeorm';

@Index('log_pkey', ['blockNumber', 'logIndex'], { unique: true })
@Entity('log', { schema: 'public' })
export class Log {
  @Column('bigint', { primary: true, name: 'block_number' })
  blockNumber: string;

  @Column('integer', { primary: true, name: 'log_index' })
  logIndex: number;

  @Column('text', { name: 'type', nullable: true })
  type: string | null;

  @Column('text', { name: 'engine' })
  engine: string;

  @Column('text', { name: 'data' })
  data: string;
}
