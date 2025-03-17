/*
  Warnings:

  - A unique constraint covering the columns `[default_chat_room_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ChatMessageType" ADD VALUE 'FORM_ATTEMPT';

-- DropForeignKey
ALTER TABLE "ChatMember" DROP CONSTRAINT "ChatMember_chat_room_id_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_chat_room_id_fkey";

-- DropForeignKey
ALTER TABLE "UnreadMessage" DROP CONSTRAINT "UnreadMessage_chat_room_id_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "FormAttempt" ADD COLUMN     "is_requested" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "default_chat_room_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_default_chat_room_id_key" ON "User"("default_chat_room_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_default_chat_room_id_fkey" FOREIGN KEY ("default_chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnreadMessage" ADD CONSTRAINT "UnreadMessage_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
