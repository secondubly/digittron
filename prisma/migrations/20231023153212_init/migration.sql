-- CreateEnum
CREATE TYPE "CommandPermission" AS ENUM ('VIEWERS', 'FOLLOWERS', 'VIPS', 'SUBSCRIBERS', 'MODERATORS', 'EDITORS', 'BROADCASTERS');

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "oauth" VARCHAR(255) NOT NULL,
    "refresh_token" VARCHAR(255) NOT NULL,
    "value" JSON DEFAULT 'null',

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commands" (
    "command_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "aliases" JSON DEFAULT '[]',
    "description" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "permission" "CommandPermission" NOT NULL DEFAULT 'VIEWERS',

    CONSTRAINT "commands_pkey" PRIMARY KEY ("command_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_id_name_key" ON "settings"("id", "name");
