-- DropForeignKey
ALTER TABLE "FormOption" DROP CONSTRAINT "FormOption_question_id_fkey";

-- AddForeignKey
ALTER TABLE "FormOption" ADD CONSTRAINT "FormOption_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "FormQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
