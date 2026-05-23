import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Loan } from './Loan';
import { Obligation } from './Obligation';

/**
 * Transaction Type Enum
 * Represents the type of transaction
 */
export enum TransactionType {
  PAYMENT = 'payment',
  ADJUSTMENT = 'adjustment',
  REVERSAL = 'reversal',
}

/**
 * Transaction Entity
 * Represents a financial transaction (payment, adjustment, etc.)
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.2, 8.4
 */
@Entity('transactions')
export class Transaction {
  /**
   * Unique identifier for the transaction
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * ID of the associated loan (if applicable)
   */
  @Column({ type: 'uuid', nullable: true })
  loanId!: string | null;

  /**
   * Reference to the associated loan
   */
  @ManyToOne(() => Loan, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan!: Loan | null;

  /**
   * ID of the associated obligation (if applicable)
   */
  @Column({ type: 'uuid', nullable: true })
  obligationId!: string | null;

  /**
   * Reference to the associated obligation
   */
  @ManyToOne(() => Obligation, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'obligationId' })
  obligation!: Obligation | null;

  /**
   * Type of transaction (payment, adjustment, reversal)
   */
  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.PAYMENT,
  })
  type!: TransactionType;

  /**
   * Amount of the transaction
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  /**
   * Balance before the transaction
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceBefore!: number;

  /**
   * Balance after the transaction
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceAfter!: number;

  /**
   * Timestamp when the transaction was created
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Optional note about the transaction
   */
  @Column({ type: 'text', nullable: true })
  note!: string | null;
}
