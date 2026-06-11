import { Migration } from '@mikro-orm/migrations';

export class Migration20260609161422 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`alter table \`oauth_token\` drop column \`expires_at\`;`);
    this.addSql(`alter table \`oauth_token\` add column \`expires_in\` integer null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table \`oauth_token\` drop column \`expires_in\`;`);
    this.addSql(`alter table \`oauth_token\` add column \`expires_at\` datetime null;`);
  }

}
