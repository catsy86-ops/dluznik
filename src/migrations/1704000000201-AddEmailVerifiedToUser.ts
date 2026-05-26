import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration: Add emailVerified and emailVerifiedAt columns to User table
 * Supports the email verification flow — new users default to unverified.
 *
 * Requirements: 2.1, 2.5
 */
export class AddEmailVerifiedToUser1704000000201 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'emailVerified',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'emailVerifiedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'emailVerifiedAt');
    await queryRunner.dropColumn('user', 'emailVerified');
  }
}
