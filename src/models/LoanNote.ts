import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Loan } from './Loan';

@Entity('loan_note')
export class LoanNote {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  loanId!: string;

  @ManyToOne(() => Loan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan!: Loan;

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
