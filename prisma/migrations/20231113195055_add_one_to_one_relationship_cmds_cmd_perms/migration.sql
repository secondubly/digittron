-- AlterTable
ALTER TABLE "commands" ADD COLUMN     "id" SERIAL NOT NULL;

-- AddForeignKey
ALTER TABLE "commands" ADD CONSTRAINT "commands_name_fkey" FOREIGN KEY ("name") REFERENCES "command_permissions"("name") ON DELETE CASCADE ON UPDATE CASCADE;
