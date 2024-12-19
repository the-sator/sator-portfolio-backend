/*
  Warnings:

  - You are about to drop the column `admin_id` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ChatMessage` table. All the data in the column will be lost.
  - Added the required column `chat_room_id` to the `ChatMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chat_member_id` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chat_room_id` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_user_id_fkey";

-- AlterTable
ALTER TABLE "ChatMember" ADD COLUMN     "chat_room_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "admin_id",
DROP COLUMN "user_id",
ADD COLUMN     "chat_member_id" TEXT NOT NULL,
ADD COLUMN     "chat_room_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chat_member_id_fkey" FOREIGN KEY ("chat_member_id") REFERENCES "ChatMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
