import { Migration } from '@mikro-orm/migrations';

export class Migration20260616102306 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`audio_alert\` (\`id\` integer not null primary key autoincrement, \`owner_twitch_id\` text not null, \`chatter_id\` text not null, \`chatter_name\` text not null, \`audio_url\` text not null, \`filename\` text not null, \`volume\` integer not null default 0.5, \`enabled\` integer not null default true, \`created_at\` datetime not null, \`updated_at\` datetime not null, constraint \`audio_alert_owner_twitch_id_foreign\` foreign key (\`owner_twitch_id\`) references \`user\` (\`twitch_id\`));`);
    this.addSql(`create index \`audio_alert_owner_twitch_id_index\` on \`audio_alert\` (\`owner_twitch_id\`);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists \`audio_alert\`;`);
  }

}
