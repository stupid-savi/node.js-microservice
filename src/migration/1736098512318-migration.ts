import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1736098512318 implements MigrationInterface {
  name = 'Migration1736098512318'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`,
    )
    await queryRunner.renameTable('user', 'users')
    await queryRunner.renameTable('refresh_token', 'refreshTokens')
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_265bec4e500714d5269580a0219" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_265bec4e500714d5269580a0219"`,
    )
    await queryRunner.renameTable('users', 'user')
    await queryRunner.renameTable('rereshTokens', 'refresh_token')
  }
}
