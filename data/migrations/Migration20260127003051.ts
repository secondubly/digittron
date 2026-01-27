import { Migration } from '@mikro-orm/migrations';

export class Migration20260127003051 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`token\` drop column \`twitch_refresh_token\`;`);
    this.addSql(`alter table \`token\` drop column \`spotify_refresh_token\`;`);
  }

}
