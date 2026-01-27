import { Migration } from '@mikro-orm/migrations'

export class Migration20260126063005 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table \`token\` add column \`twitch_access_token\` text null;`,
        )
        this.addSql(
            `alter table \`token\` add column \`twitch_refresh_token\` text null;`,
        )
    }
}
