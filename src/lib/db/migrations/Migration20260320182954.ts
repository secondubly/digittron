import { Migration } from '@mikro-orm/migrations';

export class Migration20260320182954 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`pragma foreign_keys = off;`);
    this.addSql(`create table \`user__temp_alter\` (\`id\` integer not null primary key autoincrement, \`username\` text not null, \`password\` text not null);`);
    this.addSql(`insert into \`user__temp_alter\` select \`id\`, \`username\`, \`password\` from \`user\`;`);
    this.addSql(`drop table \`user\`;`);
    this.addSql(`alter table \`user__temp_alter\` rename to \`user\`;`);
    this.addSql(`pragma foreign_keys = on;`);
  }

}
