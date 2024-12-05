-- CreateEnum
CREATE TYPE "CategoryColor" AS ENUM ('RED', 'VIOLET', 'GREEN', 'PURPLE', 'YELLOW', 'ORANGE', 'GRAY', 'TEAL', 'INDIGO', 'BLUE');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "color" "CategoryColor" NOT NULL DEFAULT 'BLUE';
