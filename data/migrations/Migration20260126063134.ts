import { Migration } from '@mikro-orm/migrations'

export class Migration20260126063134 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `UPDATE \`token\` SET \`twitch_access_token\` = \`access_token\``,
        )
        this.addSql(
            `UPDATE \`token\` SET \`twitch_refresh_token\` = \`refresh_token\``,
        )
    }

    override async down(): Promise<void> {
        this.addSql(`UPDATE \'token\' SET \`twitch_access_token\` = NULL`)
        this.addSql(`UPDATE \'token\' SET \`twitch_refresh_token\` = NULL`)
    }
}
