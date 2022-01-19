import { Column, Entity, Index } from 'typeorm';

@Index('event_pkey', ['blockNumber', 'eventIndex'], { unique: true })
@Entity('event', { schema: 'public' })
export class Event {
  @Column('bigint', { primary: true, name: 'block_number' })
  blockNumber: string;

  @Column('integer', { primary: true, name: 'event_index' })
  eventIndex: number;

  @Column('text', { name: 'section' })
  section: string;

  @Column('text', { name: 'method' })
  method: string;

  @Column('text', { name: 'phase' })
  phase: string;

  @Column('text', { name: 'data' })
  data: string;

  @Column('bigint', { name: 'timestamp', nullable: true })
  timestamp: string | null;

  @Column('text', { name: 'amount', nullable: true })
  amount: string | null;
}
