import { Migration } from '@mikro-orm/migrations';

export class Migration20260322210348 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`command\` (\`id\` integer not null primary key autoincrement, \`name\` text not null, \`aliases\` text not null, \`enabled\` integer not null default true, \`response\` text not null, \`description\` text null, \`permission_level\` integer null);`);
  }

}
