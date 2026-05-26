import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClientGuestAndOrderUserRelation1779800000000 implements MigrationInterface {
  name = 'ClientGuestAndOrderUserRelation1779800000000';
  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."app_user_role_enum" ADD VALUE IF NOT EXISTS 'CLIENT'`);

    await queryRunner.query(`ALTER TABLE "app_user" ADD COLUMN "phone" character varying(20)`);
    await queryRunner.query(`ALTER TABLE "app_user" ADD COLUMN "normalizedName" character varying(120)`);
    await queryRunner.query(`ALTER TABLE "app_user" ADD COLUMN "normalizedPhone" character varying(20)`);
    await queryRunner.query(`ALTER TABLE "app_user" ADD COLUMN "isGuest" boolean NOT NULL DEFAULT false`);

    await queryRunner.query(`CREATE INDEX "IDX_app_user_normalized_identity" ON "app_user" ("normalizedName", "normalizedPhone")`);

    await queryRunner.query(`ALTER TABLE "order" ADD COLUMN "userId" integer`);
    await queryRunner.query(`CREATE INDEX "IDX_order_user_id" ON "order" ("userId")`);
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_order_user_id" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_order_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_order_user_id"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "userId"`);

    await queryRunner.query(`DROP INDEX "public"."IDX_app_user_normalized_identity"`);
    await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "isGuest"`);
    await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "normalizedPhone"`);
    await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "normalizedName"`);
    await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "phone"`);

    await queryRunner.query(`UPDATE "app_user" SET "role" = 'STUDENT' WHERE "role" = 'CLIENT'`);
    await queryRunner.query(`ALTER TYPE "public"."app_user_role_enum" RENAME TO "app_user_role_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."app_user_role_enum" AS ENUM('ADMIN', 'ASSISTANT', 'STUDENT')`);
    await queryRunner.query(
      `ALTER TABLE "app_user" ALTER COLUMN "role" TYPE "public"."app_user_role_enum" USING "role"::text::"public"."app_user_role_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."app_user_role_enum_old"`);
  }
}
