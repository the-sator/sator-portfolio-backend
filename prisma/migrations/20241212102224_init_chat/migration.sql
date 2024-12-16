-- CreateEnum
CREATE TYPE "ChatMemberRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "is_group" BOOLEAN NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMember" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ChatMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMember_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
