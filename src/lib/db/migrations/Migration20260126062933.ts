import { Migration } from '@mikro-orm/migrations';

export class Migration20260126062933 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists \`token\` (\`id\` integer not null primary key autoincrement, \`access_token\` text not null, \`refresh_token\` text not null);`);
  }

}
