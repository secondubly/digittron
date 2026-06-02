import { Migration } from '@mikro-orm/migrations';

export class Migration20260601234407 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`chat_log\` (\`id\` integer not null primary key autoincrement, \`user_id\` text not null, \`message\` text not null, \`created_at\` datetime not null);`);

    this.addSql(`alter table \`command\` add column \`created_at\` datetime not null;`);
    this.addSql(`alter table \`command\` add column \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`token\` rename column \`spotify_access_token\` to \`spotify_refresh_token\`;`);
  }

}
