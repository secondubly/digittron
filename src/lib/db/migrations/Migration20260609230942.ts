import { Migration } from '@mikro-orm/migrations';

export class Migration20260609230942 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`user\` (\`twitch_id\` text not null primary key, \`username\` text not null, \`avatar\` text null, \`access_token_encrypted\` text not null, \`refresh_token_encrypted\` text not null, \`expires_in\` integer not null, \`scopes\` text not null, \`created_at\` datetime null);`);
  }

  override down(): void | Promise<void> {

    this.addSql(`drop table if exists \`user\`;`);
  }

}
