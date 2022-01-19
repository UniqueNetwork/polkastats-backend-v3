import { Column, Entity, Index } from 'typeorm';

@Index('system_pkey', ['blockHeight'], { unique: true })
@Entity('system', { schema: 'public' })
export class System {
  @Column('bigint', { primary: true, name: 'block_height' })
  blockHeight: string;

  @Column('text', { name: 'chain' })
  chain: string;

  @Column('text', { name: 'node_name' })
  nodeName: string;

  @Column('text', { name: 'node_version' })
  nodeVersion: string;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
