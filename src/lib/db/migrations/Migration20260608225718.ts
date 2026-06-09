import { Migration } from '@mikro-orm/migrations';

export class Migration20260608225718 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table \`user\` add column \`avatar\` text null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table \`user\` drop column \`avatar\`;`);
  }

}
