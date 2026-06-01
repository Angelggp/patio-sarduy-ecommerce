import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLianaGrowthForm1780200000000 implements MigrationInterface {
  name = 'AddLianaGrowthForm1780200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."product_growthform_enum" ADD VALUE IF NOT EXISTS 'LIANA'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Postgres does not support removing enum values safely.
  }
}
