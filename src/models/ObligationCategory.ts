import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from './User';
import { Obligation } from './Obligation';

@Entity('obligation_category')
export class ObligationCategory {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('uuid')
  obligationId!: string;

  @ManyToOne(() => Obligation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'obligationId' })
  obligation!: Obligation;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  constructor() {
    if (!this.id) this.id = uuid();
  }
}
