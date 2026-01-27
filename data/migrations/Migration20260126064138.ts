import { Migration } from '@mikro-orm/migrations';

export class Migration20260126064138 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`token\` add column \`spotify_access_token\` text null;`);
    this.addSql(`alter table \`token\` add column \`spotify_refresh_token\` text null;`);
  }

}
