import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersAuthSeed1779670000000 implements MigrationInterface {
  name = 'UsersAuthSeed1779670000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."app_user_role_enum" AS ENUM('ADMIN', 'ASSISTANT', 'STUDENT')`);
    await queryRunner.query(
      `CREATE TABLE "app_user" ("id" SERIAL NOT NULL, "username" character varying(80) NOT NULL, "name" character varying(120) NOT NULL, "passwordHash" character varying(255) NOT NULL, "role" "public"."app_user_role_enum" NOT NULL, "refreshTokenHash" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_app_user_username" UNIQUE ("username"), CONSTRAINT "PK_5a326dcce5e07bd54ecf720d45d" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `INSERT INTO "app_user" ("username", "name", "passwordHash", "role", "isActive")
       VALUES ('admin', 'admin', '$2b$10$tDZPNUv6bfJKyH0opdPmRexl1JXn6weyOMZtIZnlZPWDSz5riER9C', 'ADMIN', true)
       ON CONFLICT ("username") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "app_user" WHERE "username" = 'admin'`);
    await queryRunner.query(`DROP TABLE "app_user"`);
    await queryRunner.query(`DROP TYPE "public"."app_user_role_enum"`);
  }
}
