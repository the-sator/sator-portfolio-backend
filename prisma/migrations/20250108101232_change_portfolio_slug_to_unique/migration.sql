/*
  Warnings:

  - A unique constraint covering the columns `[last_message_id]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Portfolio` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_admin_id_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "admin_id" TEXT,
ADD COLUMN     "site_user_id" TEXT;

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "media" TEXT[];

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "last_message_id" TEXT;

-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "site_user_id" TEXT,
ALTER COLUMN "admin_id" DROP NOT NULL,
ALTER COLUMN "cover_url" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SiteUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "profile_url" TEXT,
    "totp_key" BYTEA,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteUserSession" (
    "id" TEXT NOT NULL,
    "site_user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "two_factor_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SiteUserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnreadMessage" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "chat_room_id" TEXT NOT NULL,
    "chat_member_id" TEXT NOT NULL,
    "total_count" INTEGER NOT NULL,

    CONSTRAINT "UnreadMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteUser_email_key" ON "SiteUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SiteUser_username_key" ON "SiteUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_last_message_id_key" ON "ChatRoom"("last_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_slug_key" ON "Portfolio"("slug");

-- AddForeignKey
ALTER TABLE "SiteUserSession" ADD CONSTRAINT "SiteUserSession_site_user_id_fkey" FOREIGN KEY ("site_user_id") REFERENCES "SiteUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_site_user_id_fkey" FOREIGN KEY ("site_user_id") REFERENCES "SiteUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_site_user_id_fkey" FOREIGN KEY ("site_user_id") REFERENCES "SiteUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnreadMessage" ADD CONSTRAINT "UnreadMessage_chat_member_id_fkey" FOREIGN KEY ("chat_member_id") REFERENCES "ChatMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnreadMessage" ADD CONSTRAINT "UnreadMessage_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
