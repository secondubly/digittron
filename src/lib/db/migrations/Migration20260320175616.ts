import { Migration } from '@mikro-orm/migrations';

export class Migration20260320175616 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`user\` (\`id\` integer not null primary key autoincrement, \`username\` text not null, \`password\` text null);`);
  }

}
