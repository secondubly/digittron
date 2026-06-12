import { Migration } from '@mikro-orm/migrations';

export class Migration20260612032131 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`oauth_token__temp_alter\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`twitch_id\` text null, \`provider_name\` text not null, \`access_token_encrypted\` text not null, \`refresh_token_encrypted\` text null, \`token_type\` text null default 'Bearer', \`expires_in\` integer null, constraint \`oauth_token_twitch_id_foreign\` foreign key (\`twitch_id\`) references \`user\` (\`twitch_id\`) on delete cascade);`);
    this.addSql(`insert into \`oauth_token__temp_alter\` select \`id\`, \`created_at\`, \`updated_at\`, \`twitch_id\`, \`provider_name\`, \`access_token_encrypted\`, \`refresh_token_encrypted\`, \`token_type\`, \`expires_in\` from \`oauth_token\`;`);
    this.addSql(`drop table \`oauth_token\`;`);
    this.addSql(`alter table \`oauth_token__temp_alter\` rename to \`oauth_token\`;`);
    this.addSql(`create index \`oauth_token_twitch_id_index\` on \`oauth_token\` (\`twitch_id\`);`);
    this.addSql(`pragma foreign_keys = on;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`oauth_token__temp_alter\` (\`access_token_encrypted\` text not null, \`created_at\` datetime not null, \`expires_in\` integer null, \`id\` integer not null primary key autoincrement, \`provider_name\` text not null, \`refresh_token_encrypted\` text null, \`token_type\` text null default 'Bearer', \`twitch_id\` text not null, \`updated_at\` datetime not null, constraint \`oauth_token_twitch_id_foreign\` foreign key (\`twitch_id\`) references \`user\` (\`twitch_id\`) on delete cascade);`);
    this.addSql(`insert into \`oauth_token__temp_alter\` select \`access_token_encrypted\`, \`created_at\`, \`expires_in\`, \`id\`, \`provider_name\`, \`refresh_token_encrypted\`, \`token_type\`, \`twitch_id\`, \`updated_at\` from \`oauth_token\`;`);
    this.addSql(`drop table \`oauth_token\`;`);
    this.addSql(`alter table \`oauth_token__temp_alter\` rename to \`oauth_token\`;`);
    this.addSql(`create index \`oauth_token_twitch_id_index\` on \`oauth_token\` (\`twitch_id\`);`);
    this.addSql(`pragma foreign_keys = on;`);
  }

}
