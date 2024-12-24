-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_chat_member_id_fkey";

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chat_member_id_fkey" FOREIGN KEY ("chat_member_id") REFERENCES "ChatMember"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
