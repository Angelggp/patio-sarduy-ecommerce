import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPopularUseColumnCasing1780300000000 implements MigrationInterface {
  name = 'FixPopularUseColumnCasing1780300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'product'
            AND column_name = 'mainPopularUsePopularUse'
        ) THEN
          ALTER TABLE "product"
          RENAME COLUMN "mainPopularUsePopularUse" TO "mainPopularUsePopularuse";
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
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'product'
            AND column_name = 'mainPopularUsePopularuse'
        ) THEN
          ALTER TABLE "product"
          RENAME COLUMN "mainPopularUsePopularuse" TO "mainPopularUsePopularUse";
        END IF;
      END
      $$;
    `);
  }
}
