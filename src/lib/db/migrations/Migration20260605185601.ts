import { Migration } from '@mikro-orm/migrations';

export class Migration20260605185601 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table \`moderation_flag\` add column \`value\` integer not null default true;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table \`moderation_flag\` drop column \`value\`;`);
  }

}
