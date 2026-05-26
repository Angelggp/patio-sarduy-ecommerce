import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameConfirmedToReadyOrderStatus1780000000000 implements MigrationInterface {
  name = 'RenameConfirmedToReadyOrderStatus1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_enum enum
          JOIN pg_type type ON type.oid = enum.enumtypid
          JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
          WHERE namespace.nspname = 'public'
            AND type.typname = 'order_status_enum'
            AND enum.enumlabel = 'CONFIRMED'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM pg_enum enum
          JOIN pg_type type ON type.oid = enum.enumtypid
          JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
          WHERE namespace.nspname = 'public'
            AND type.typname = 'order_status_enum'
            AND enum.enumlabel = 'READY'
        ) THEN
          ALTER TYPE "public"."order_status_enum" RENAME VALUE 'CONFIRMED' TO 'READY';
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_enum enum
          JOIN pg_type type ON type.oid = enum.enumtypid
          JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
          WHERE namespace.nspname = 'public'
            AND type.typname = 'order_status_enum'
            AND enum.enumlabel = 'READY'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM pg_enum enum
          JOIN pg_type type ON type.oid = enum.enumtypid
          JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
          WHERE namespace.nspname = 'public'
            AND type.typname = 'order_status_enum'
            AND enum.enumlabel = 'CONFIRMED'
        ) THEN
          ALTER TYPE "public"."order_status_enum" RENAME VALUE 'READY' TO 'CONFIRMED';
        END IF;
      END
      $$;
    `);
  }
}
