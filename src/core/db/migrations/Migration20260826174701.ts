import { Migration } from '@mikro-orm/migrations'

export class Migration20260826174701 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table \`channel\` (\`id\` integer not null primary key autoincrement, \`twitch_id\` text not null, \`name\` text not null);`,
    )
    this.addSql(`create unique index \`channel_twitch_id_unique\` on \`channel\` (\`twitch_id\`);`)
    this.addSql(`create unique index \`channel_name_unique\` on \`channel\` (\`name\`);`)

    this.addSql(
      `create table \`custom_command\` (\`id\` integer not null primary key autoincrement, \`channel_id\` integer not null, \`name\` text not null, \`response\` text not null, \`aliases\` json null, \`user_level\` text check (\`user_level\` in ('everyone', 'subscriber', 'vip', 'moderator', 'broadcaster')) not null default 'everyone', \`cooldown_seconds\` integer not null default 0, \`user_cooldown_seconds\` integer not null default 0, \`last_used_at\` datetime null, \`usage_count\` integer not null default 0, \`enabled\` integer not null default true, \`created_by\` text not null, constraint \`custom_command_channel_id_foreign\` foreign key (\`channel_id\`) references \`channel\` (\`id\`));`,
    )
    this.addSql(
      `create index \`custom_command_channel_id_index\` on \`custom_command\` (\`channel_id\`);`,
    )
    this.addSql(
      `create unique index \`custom_command_channel_id_name_unique\` on \`custom_command\` (\`channel_id\`, \`name\`);`,
    )
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists \`channel\`;`)
    this.addSql(`drop table if exists \`custom_command\`;`)
  }
}
