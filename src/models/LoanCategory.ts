import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from './User';
import { Loan } from './Loan';

@Entity('loan_category')
export class LoanCategory {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('uuid')
  loanId!: string;

  @ManyToOne(() => Loan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan!: Loan;

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
