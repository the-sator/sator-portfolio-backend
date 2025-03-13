-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_attempt_id_fkey";

-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_option_id_fkey";

-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_question_id_fkey";

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "FormAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "FormOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "FormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
