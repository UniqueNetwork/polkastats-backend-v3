import { Column, Entity, Index } from 'typeorm';

@Index('SequelizeMeta_pkey', ['name'], { unique: true })
@Entity('SequelizeMeta', { schema: 'public' })
export class SequelizeMeta {
  @Column('character varying', { primary: true, name: 'name', length: 255 })
  name: string;
}
