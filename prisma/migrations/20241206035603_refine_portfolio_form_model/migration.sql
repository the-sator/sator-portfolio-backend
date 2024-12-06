/*
  Warnings:

  - You are about to drop the column `user_id` on the `FormResponse` table. All the data in the column will be lost.
  - Added the required column `attempt_id` to the `FormResponse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_user_id_fkey";

-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "user_id",
ADD COLUMN     "attempt_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FormAttempt" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "FormAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "FormAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAttempt" ADD CONSTRAINT "FormAttempt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
