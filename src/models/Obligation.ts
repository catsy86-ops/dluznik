import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

/**
 * Obligation Status Enum
 */
export enum ObligationStatus {
  ACTIVE = 'active',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PAUSED = 'paused',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

/**
 * Obligation Entity
 * Represents an obligation or debt owed to a creditor
 * 
 * Requirements: 4.1
 */
@Entity('obligation')
export class Obligation {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  creditorName!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  originalAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  currentBalance!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: ObligationStatus.ACTIVE,
  })
  status!: ObligationStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate!: Date | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 3, default: 'PLN' })
  currency!: string;

  @Column({ type: 'timestamp', nullable: true })
  statusChangedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  statusReason!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  interestRate!: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true, default: null })
  interestType!: 'simple' | 'compound' | null;

  @Column({ type: 'text', nullable: true })
  category!: string | null;
}
