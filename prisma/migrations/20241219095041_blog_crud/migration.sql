-- CreateTable
CREATE TABLE "CategoryOnBlog" (
    "blog_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "CategoryOnBlog_pkey" PRIMARY KEY ("blog_id","category_id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "content" JSONB,
    "like" INTEGER NOT NULL DEFAULT 0,
    "view" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CategoryOnBlog" ADD CONSTRAINT "CategoryOnBlog_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryOnBlog" ADD CONSTRAINT "CategoryOnBlog_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
