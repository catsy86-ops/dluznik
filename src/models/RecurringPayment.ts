import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Loan } from './Loan';
import { Obligation } from './Obligation';

export enum RecurrenceFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

@Entity('recurring_payment')
export class RecurringPayment {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { nullable: true })
  loanId!: string | null;

  @ManyToOne(() => Loan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan!: Loan | null;

  @Column('uuid', { nullable: true })
  obligationId!: string | null;

  @ManyToOne(() => Obligation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'obligationId' })
  obligation!: Obligation | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 20 })
  frequency!: RecurrenceFrequency;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  nextPaymentDate!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor() {
    if (!this.id) this.id = uuid();
  }
}
