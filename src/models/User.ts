import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * User Entity
 * Represents a user account in the system
 */
@Entity('user')
export class User {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ type: 'boolean', default: true })
  notificationsEnabled!: boolean;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt!: Date | null;
}
