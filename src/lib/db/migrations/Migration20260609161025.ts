import { Migration } from '@mikro-orm/migrations';

export class Migration20260609161025 extends Migration {

  override up(): void | Promise<void> {

    this.addSql(`drop table if exists \`command\`;`);
    this.addSql(`drop table if exists \`user\`;`);

    this.addSql(`alter table \`oauth_token\` rename column \`access_token\` to \`access_token_encrypted\`;`);
    this.addSql(`alter table \`oauth_token\` rename column \`refresh_token\` to \`refresh_token_encrypted\`;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`create table \`command\` (\`aliases\` text not null, \`created_at\` datetime not null, \`description\` text null, \`enabled\` integer not null default true, \`id\` integer not null primary key autoincrement, \`name\` text not null, \`permission_level\` integer null, \`response\` text not null, \`updated_at\` datetime not null);`);

    this.addSql(`create table \`user\` (\`access_token_encrypted\` text not null, \`avatar\` text null, \`expires_at\` integer not null, \`refresh_token_encrypted\` text not null, \`scopes\` text not null, \`twitch_id\` text not null primary key, \`username\` text not null);`);

    this.addSql(`alter table \`oauth_token\` rename column \`access_token_encrypted\` to \`access_token\`;`);
    this.addSql(`alter table \`oauth_token\` rename column \`refresh_token_encrypted\` to \`refresh_token\`;`);
  }

}
