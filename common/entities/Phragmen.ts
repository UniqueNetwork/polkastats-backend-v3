import { Column, Entity, Index } from 'typeorm';

@Index('phragmen_pkey', ['blockHeight'], { unique: true })
@Entity('phragmen', { schema: 'public' })
export class Phragmen {
  @Column('bigint', { primary: true, name: 'block_height' })
  blockHeight: string;

  @Column('text', { name: 'phragmen_json' })
  phragmenJson: string;

  @Column('bigint', { name: 'timestamp' })
  timestamp: string;
}
