import { Migration } from '@mikro-orm/migrations';

export class Migration20260617000458 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`chat_log\` (\`id\` integer not null primary key autoincrement, \`user_id\` text not null, \`message\` text not null, \`created_at\` datetime not null);`);

    this.addSql(`create table \`moderation_flag\` (\`id\` integer not null primary key autoincrement, \`key\` text not null, \`value\` integer not null default true, \`label\` text null, \`created_at\` datetime not null, \`updated_at\` datetime not null);`);
    this.addSql(`create unique index \`moderation_flag_key_unique\` on \`moderation_flag\` (\`key\`);`);

    this.addSql(`create table \`user\` (\`twitch_id\` text not null primary key, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`username\` text not null, \`avatar\` text null, \`access_token_encrypted\` text not null, \`refresh_token_encrypted\` text not null, \`expires_in\` integer not null, \`scopes\` text not null);`);

    this.addSql(`create table \`oauth_token\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`twitch_id\` text null, \`provider_name\` text not null, \`access_token_encrypted\` text not null, \`refresh_token_encrypted\` text null, \`token_type\` text null default 'Bearer', \`expires_in\` integer null, constraint \`oauth_token_twitch_id_foreign\` foreign key (\`twitch_id\`) references \`user\` (\`twitch_id\`) on delete cascade);`);
    this.addSql(`create index \`oauth_token_twitch_id_index\` on \`oauth_token\` (\`twitch_id\`);`);

    this.addSql(`create table \`audio_alert\` (\`id\` integer not null primary key autoincrement, \`owner_twitch_id\` text not null, \`chatter_id\` text not null, \`chatter_name\` text not null, \`audio_url\` text not null, \`filename\` text not null, \`volume\` integer not null default 0.5, \`enabled\` integer not null default true, \`created_at\` datetime not null, \`updated_at\` datetime not null, constraint \`audio_alert_owner_twitch_id_foreign\` foreign key (\`owner_twitch_id\`) references \`user\` (\`twitch_id\`));`);
    this.addSql(`create index \`audio_alert_owner_twitch_id_index\` on \`audio_alert\` (\`owner_twitch_id\`);`);
  }

}
