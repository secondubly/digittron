-- CreateEnum
CREATE TYPE "PermissionLevel" AS ENUM ('VIEWER', 'FOLLOWER', 'REGULAR', 'VIP', 'SUBSCRIBER', 'MODERATOR', 'EDITOR', 'BROADCASTER');

-- DropEnum
DROP TYPE "CommandPermission";

-- CreateTable
CREATE TABLE "commandPermissions" (
    "name" VARCHAR(255) NOT NULL,
    "level" "PermissionLevel" NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "commandPermissions_pkey" PRIMARY KEY ("name")
);
