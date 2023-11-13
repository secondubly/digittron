/*
  Warnings:

  - You are about to drop the `commandPermissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "commandPermissions";

-- CreateTable
CREATE TABLE "command_permissions" (
    "name" VARCHAR(255) NOT NULL,
    "level" "PermissionLevel" NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "command_permissions_pkey" PRIMARY KEY ("name")
);
