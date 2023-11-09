/*
  Warnings:

  - The primary key for the `commands` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `command_id` on the `commands` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `commands` table. All the data in the column will be lost.
  - You are about to drop the column `permission` on the `commands` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "commands" DROP CONSTRAINT "commands_pkey",
DROP COLUMN "command_id",
DROP COLUMN "description",
DROP COLUMN "permission",
ADD CONSTRAINT "commands_pkey" PRIMARY KEY ("name");
