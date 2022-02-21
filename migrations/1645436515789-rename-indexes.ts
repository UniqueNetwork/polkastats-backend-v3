import {MigrationInterface, QueryRunner} from "typeorm";

export class renameIndexes1645436515789 implements MigrationInterface {
    name = 'renameIndexes1645436515789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "tokens_collection_id_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."event_method_idx"`);
        await queryRunner.query(`DROP INDEX "public"."event_section_method_phase_idx"`);
        await queryRunner.query(`DROP INDEX "public"."event_block_index_idx"`);
        await queryRunner.query(`DROP INDEX "public"."extrinsic_block_index_idx"`);
        await queryRunner.query(`DROP INDEX "public"."extrinsic_to_owner_idx"`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "date_of_creation"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "mint_mode"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "date_of_creation"`);
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "block_index"`);
        await queryRunner.query(`ALTER TABLE "extrinsic" DROP COLUMN "block_index"`);
        await queryRunner.query(`ALTER TABLE "extrinsic" DROP COLUMN "to_owner"`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "collection_id"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "collection_id" bigint NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "account_pkey" ON "account" ("account_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "block_pkey" ON "block" ("block_number") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "chain_pkey" ON "chain" ("block_height") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "tokens_pkey" ON "tokens" ("id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "collections_pkey" ON "collections" ("collection_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "event_pkey" ON "event" ("block_number", "event_index") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "extrinsic_pkey" ON "extrinsic" ("block_number", "extrinsic_index") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "harvester_error_pkey" ON "harvester_error" ("block_number") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "intention_pkey" ON "intention" ("account_id", "block_height", "session_index") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "log_pkey" ON "log" ("block_number", "log_index") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "nominator_pkey" ON "nominator" ("account_id", "block_height", "session_index") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "nominator_era_slash_pkey" ON "nominator_era_slash" ("era_index", "stash_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "phragmen_pkey" ON "phragmen" ("block_height") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "system_pkey" ON "system" ("block_height") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "total_pkey" ON "total" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "validator_pkey" ON "validator" ("account_id", "block_height", "session_index") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "validator_era_slash_pkey" ON "validator_era_slash" ("era_index", "stash_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "validator_era_staking_pkey" ON "validator_era_staking" ("era_index", "era_points") `);
        await queryRunner.query(`ALTER TABLE "tokens" ADD CONSTRAINT "FK_0c3081d08354c10d3553f4678d0" FOREIGN KEY ("collection_id") REFERENCES "collections"("collection_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "FK_0c3081d08354c10d3553f4678d0"`);
        await queryRunner.query(`DROP INDEX "public"."validator_era_staking_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."validator_era_slash_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."validator_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."total_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."system_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."phragmen_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."nominator_era_slash_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."nominator_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."log_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."intention_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."harvester_error_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."extrinsic_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."event_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."collections_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."tokens_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."chain_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."block_pkey"`);
        await queryRunner.query(`DROP INDEX "public"."account_pkey"`);
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "collection_id"`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "collection_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "extrinsic" ADD "to_owner" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "extrinsic" ADD "block_index" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event" ADD "block_index" text`);
        await queryRunner.query(`ALTER TABLE "collections" ADD "date_of_creation" bigint`);
        await queryRunner.query(`ALTER TABLE "collections" ADD "mint_mode" boolean`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD "date_of_creation" bigint`);
        await queryRunner.query(`CREATE INDEX "extrinsic_to_owner_idx" ON "extrinsic" ("to_owner") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "extrinsic_block_index_idx" ON "extrinsic" ("block_index") `);
        await queryRunner.query(`CREATE INDEX "event_block_index_idx" ON "event" ("block_index") `);
        await queryRunner.query(`CREATE INDEX "event_section_method_phase_idx" ON "event" ("section", "method", "phase") `);
        await queryRunner.query(`CREATE INDEX "event_method_idx" ON "event" ("method") `);
        await queryRunner.query(`ALTER TABLE "tokens" ADD CONSTRAINT "tokens_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("collection_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
