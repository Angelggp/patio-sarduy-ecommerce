import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCsvImportFields1780100000000 implements MigrationInterface {
  name = 'AddCsvImportFields1780100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Nuevo campo: número de planta del catálogo físico
    await queryRunner.query(`ALTER TABLE "product" ADD "plantNumber" integer`);

    // Nuevo campo: uso popular general
    await queryRunner.query(
      `ALTER TABLE "product" ADD "mainPopularUsePopularUse" boolean NOT NULL DEFAULT false`,
    );

    // Ampliar scientificName a 255 caracteres (nombres largos del CSV)
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "scientificName" TYPE character varying(255)`,
    );

    // Hacer nullable los campos que pueden estar vacíos en el CSV
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "growthForm" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "origin" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "provenance" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "collector" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "threatCategory" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "isEndemic" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "population" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "registrationDate" DROP NOT NULL`,
    );

    // Agregar DEFAULT false a los booleanos existentes de mainPopularUse
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "mainPopularUseCulinary" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "mainPopularUseMedicinal" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "mainPopularUseAromatic" SET DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "mainPopularUseAromatic" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "mainPopularUseMedicinal" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "mainPopularUseCulinary" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "registrationDate" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "population" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "isEndemic" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "threatCategory" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "collector" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "provenance" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "origin" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "growthForm" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ALTER COLUMN "scientificName" TYPE character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "mainPopularUsePopularUse"`,
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "plantNumber"`);
  }
}
