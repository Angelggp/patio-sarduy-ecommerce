import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1779573030393 implements MigrationInterface {
    name = 'Init1779573030393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "delivery_details" ("id" SERIAL NOT NULL, "address" character varying(120) NOT NULL, "zone" character varying(80) NOT NULL, "instructions" character varying(120), "orderId" integer, CONSTRAINT "REL_a1c6bf6a76a0e916a6040a1614" UNIQUE ("orderId"), CONSTRAINT "PK_25341b2e4485f99b7328f63970f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."order_type_enum" AS ENUM('DELIVERY', 'PICKUP')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "status" "public"."order_status_enum" NOT NULL, "type" "public"."order_type_enum" NOT NULL, "customerName" character varying(100) NOT NULL, "customerPhone" character varying(20) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" SERIAL NOT NULL, "price" numeric NOT NULL, "quantity" integer NOT NULL, "productId" integer NOT NULL, "orderId" integer, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_growthform_enum" AS ENUM('TREE', 'SHRUB', 'HERB', 'CLIMBER', 'SUCCULENT', 'PALM')`);
        await queryRunner.query(`CREATE TYPE "public"."product_threatcategory_enum" AS ENUM('LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD')`);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "commonName" character varying(100) NOT NULL, "scientificName" character varying(100) NOT NULL, "genus" character varying(100) NOT NULL, "family" character varying(100) NOT NULL, "growthForm" "public"."product_growthform_enum" NOT NULL, "origin" character varying(100) NOT NULL, "provenance" character varying(100) NOT NULL, "collector" character varying(100) NOT NULL, "threatCategory" "public"."product_threatcategory_enum" NOT NULL, "isEndemic" boolean NOT NULL, "price" numeric, "population" integer NOT NULL, "registrationDate" TIMESTAMP NOT NULL, "deathDate" TIMESTAMP, "imagePath" character varying(180), "mainPopularUseCulinary" boolean NOT NULL, "mainPopularUseMedicinal" boolean NOT NULL, "mainPopularUseAromatic" boolean NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "delivery_details" ADD CONSTRAINT "FK_a1c6bf6a76a0e916a6040a16142" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_904370c093ceea4369659a3c810"`);
        await queryRunner.query(`ALTER TABLE "delivery_details" DROP CONSTRAINT "FK_a1c6bf6a76a0e916a6040a16142"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TYPE "public"."product_threatcategory_enum"`);
        await queryRunner.query(`DROP TYPE "public"."product_growthform_enum"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP TABLE "delivery_details"`);
    }

}
