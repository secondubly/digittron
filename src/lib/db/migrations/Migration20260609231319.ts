import { Migration } from '@mikro-orm/migrations';

export class Migration20260609231319 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`user__temp_alter\` (\`twitch_id\` text not null primary key, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`username\` text not null, \`avatar\` text null, \`access_token_encrypted\` text not null, \`refresh_token_encrypted\` text not null, \`expires_in\` integer not null, \`scopes\` text not null);`);
    this.addSql(`insert into \`user__temp_alter\` select \`twitch_id\`, \`created_at\`, null as \`updated_at\`, \`username\`, \`avatar\`, \`access_token_encrypted\`, \`refresh_token_encrypted\`, \`expires_in\`, \`scopes\` from \`user\`;`);
    this.addSql(`drop table \`user\`;`);
    this.addSql(`alter table \`user__temp_alter\` rename to \`user\`;`);
    this.addSql(`pragma foreign_keys = on;`);

    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`oauth_token__temp_alter\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`twitch_id\` text not null, \`provider_name\` text not null, \`access_token_encrypted\` text not null, \`refresh_token_encrypted\` text null, \`token_type\` text null default 'Bearer', \`expires_in\` integer null, constraint \`oauth_token_twitch_id_foreign\` foreign key (\`twitch_id\`) references \`user\` (\`twitch_id\`) on delete cascade);`);
    this.addSql(`insert into \`oauth_token__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`twitch_id\`, \`provider_name\`, \`access_token_encrypted\`, \`refresh_token_encrypted\`, \`token_type\`, \`expires_in\` from \`oauth_token\`;`);
    this.addSql(`drop table \`oauth_token\`;`);
    this.addSql(`alter table \`oauth_token__temp_alter\` rename to \`oauth_token\`;`);
    this.addSql(`create index \`oauth_token_twitch_id_index\` on \`oauth_token\` (\`twitch_id\`);`);
    this.addSql(`pragma foreign_keys = on;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`oauth_token__temp_alter\` (\`access_token_encrypted\` text not null, \`created_at\` datetime null, \`expires_in\` integer null, \`id\` integer not null primary key autoincrement, \`provider_name\` text not null, \`refresh_token_encrypted\` text null, \`token_type\` text null default 'Bearer', \`twitch_id\` text not null, \`updated_at\` datetime null, constraint \`oauth_token_twitch_id_foreign\` foreign key (\`twitch_id\`) references \`user\` (\`twitch_id\`) on delete cascade);`);
    this.addSql(`insert into \`oauth_token__temp_alter\` select \`access_token_encrypted\`, \`created_at\`, \`expires_in\`, \`id\`, \`provider_name\`, \`refresh_token_encrypted\`, \`token_type\`, \`twitch_id\`, \`updated_at\` from \`oauth_token\`;`);
    this.addSql(`drop table \`oauth_token\`;`);
    this.addSql(`alter table \`oauth_token__temp_alter\` rename to \`oauth_token\`;`);
    this.addSql(`create index \`oauth_token_twitch_id_index\` on \`oauth_token\` (\`twitch_id\`);`);
    this.addSql(`pragma foreign_keys = on;`);

    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`user__temp_alter\` (\`access_token_encrypted\` text not null, \`avatar\` text null, \`created_at\` datetime null, \`expires_in\` integer not null, \`refresh_token_encrypted\` text not null, \`scopes\` text not null, \`twitch_id\` text not null primary key, \`username\` text not null);`);
    this.addSql(`insert into \`user__temp_alter\` select \`access_token_encrypted\`, \`avatar\`, \`created_at\`, \`expires_in\`, \`refresh_token_encrypted\`, \`scopes\`, \`twitch_id\`, \`username\` from \`user\`;`);
    this.addSql(`drop table \`user\`;`);
    this.addSql(`alter table \`user__temp_alter\` rename to \`user\`;`);
    this.addSql(`pragma foreign_keys = on;`);
  }

}
