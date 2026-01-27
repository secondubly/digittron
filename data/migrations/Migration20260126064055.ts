import { Migration } from '@mikro-orm/migrations';

export class Migration20260126064055 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`token\` drop column \`access_token\`;`);
    this.addSql(`alter table \`token\` drop column \`refresh_token\`;`);

    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`token__temp_alter\` (\`id\` integer not null primary key autoincrement, \`twitch_access_token\` text not null, \`twitch_refresh_token\` text not null);`);
    this.addSql(`insert into \`token__temp_alter\` select \`id\`, \`twitch_access_token\`, \`twitch_refresh_token\` from \`token\`;`);
    this.addSql(`drop table \`token\`;`);
    this.addSql(`alter table \`token__temp_alter\` rename to \`token\`;`);
    this.addSql(`pragma foreign_keys = on;`);
  }

}
