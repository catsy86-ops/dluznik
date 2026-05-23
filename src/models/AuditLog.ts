import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from './User';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PAYMENT = 'payment',
  STATUS_CHANGE = 'status_change',
}

@Entity('audit_log')
export class AuditLog {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', length: 50 })
  action!: AuditAction;

  @Column({ type: 'varchar', length: 50 })
  entityType!: 'loan' | 'obligation' | 'transaction';

  @Column({ type: 'uuid' })
  entityId!: string;

  @Column({ type: 'text', nullable: true })
  oldValue!: string | null;

  @Column({ type: 'text', nullable: true })
  newValue!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  field!: string | null;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  constructor() {
    if (!this.id) this.id = uuid();
  }
}
