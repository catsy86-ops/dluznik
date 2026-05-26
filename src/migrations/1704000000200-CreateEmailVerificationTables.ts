import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration: Create EmailVerificationToken and ResendRateLimit tables
 * These tables support the email verification flow at registration.
 *
 * Requirements: 2.1, 2.5, 2.6
 */
export class CreateEmailVerificationTables1704000000200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'email_verification_token',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '64',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'usedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_EMAIL_VERIFICATION_TOKEN_USER_ID',
            columnNames: ['userId'],
          },
          {
            name: 'IDX_EMAIL_VERIFICATION_TOKEN_TOKEN',
            columnNames: ['token'],
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'resend_rate_limit',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'requestedAt',
            type: 'timestamp',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_RESEND_RATE_LIMIT_USER_ID',
            columnNames: ['userId'],
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('resend_rate_limit', true);
    await queryRunner.dropTable('email_verification_token', true);
  }
}
