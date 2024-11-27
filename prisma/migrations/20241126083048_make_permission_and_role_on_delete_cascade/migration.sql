-- DropForeignKey
ALTER TABLE "PermissionFlag" DROP CONSTRAINT "PermissionFlag_role_id_fkey";

-- AddForeignKey
ALTER TABLE "PermissionFlag" ADD CONSTRAINT "PermissionFlag_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
