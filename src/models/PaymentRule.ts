import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Loan } from './Loan';

/**
 * Payment Rule Type Enum
 */
export enum PaymentRuleType {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE = 'percentage',
  ON_DATE = 'on_date',
  ON_EVENT = 'on_event',
}

/**
 * Payment Rule Entity
 * Represents an automated payment rule for a loan
 */
@Entity('payment_rule')
export class PaymentRule {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  loanId!: string;

  @ManyToOne(() => Loan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan!: Loan;

  @Column({
    type: 'varchar',
    length: 50,
    enum: PaymentRuleType,
  })
  type!: PaymentRuleType;

  @Column({ type: 'varchar', length: 100 })
  trigger!: string; // e.g., "monthly", "payment_due", "balance_threshold"

  @Column({ type: 'varchar', length: 255 })
  action!: string; // e.g., "pay_500", "pay_50_percent", "send_notification"

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage!: number | null;

  @Column({ type: 'timestamp', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'text', nullable: true })
  description!: string | null;
}
