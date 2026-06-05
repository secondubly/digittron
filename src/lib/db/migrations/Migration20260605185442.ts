import { Migration } from '@mikro-orm/migrations';

export class Migration20260605185442 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`moderation_flag\` (\`id\` integer not null primary key autoincrement, \`key\` text not null, \`label\` text null, \`created_at\` datetime not null, \`updated_at\` datetime not null);`);
    this.addSql(`create unique index \`moderation_flag_key_unique\` on \`moderation_flag\` (\`key\`);`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists \`moderation_flag\`;`);
  }

}
