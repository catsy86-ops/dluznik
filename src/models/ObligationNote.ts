import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Obligation } from './Obligation';

@Entity('obligation_note')
export class ObligationNote {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  obligationId!: string;

  @ManyToOne(() => Obligation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'obligationId' })
  obligation!: Obligation;

  @Column('uuid')
  userId!: string;

  @Column({ type: 'text' })
  text!: string;

  @CreateDateColumn()
  createdAt!: Date;

  constructor() {
    if (!this.id) this.id = uuid();
  }
}
