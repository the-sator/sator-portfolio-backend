-- AlterTable
ALTER TABLE "ChatMember" ALTER COLUMN "admin_id" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ChatMessage" ALTER COLUMN "admin_id" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;
