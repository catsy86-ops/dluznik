import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

/**
 * ResendRateLimit Entity
 * Tracks resend verification email requests for rate limiting.
 * Max 5 requests per hour, min 60s between requests.
 *
 * Requirements: 2.6
 */
@Entity('resend_rate_limit')
export class ResendRateLimit {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'timestamp' })
  requestedAt!: Date;
}
