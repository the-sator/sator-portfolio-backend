import { LIMIT } from "@/constant/base";
import { IdentityRole, type Identity } from "@/core/types/base.type";
import { db, type DrizzleTransaction } from "@/db";
import { blogs, categories, categoryOnBlogs } from "@/db/schema";
import { ContentStatus } from "@/enum/content.enum";
import type { BlogFilter, CreateBlog } from "@/types/blog.type";
import {
  and,
  asc,
  count,
  eq,
  ilike,
  inArray,
  isNotNull,
  type SQL,
} from "drizzle-orm";

type BlogWhere = {
  site_user_id?: string;
};

export class BlogRepository {
  public buildFilter(filter: BlogFilter) {
    const conditions: SQL[] = [];
    if (filter.title) {
      conditions.push(ilike(blogs.title, `%${filter.title}%`));
    }
    return conditions;
  }

  private getCategoryFilter(filter: BlogFilter) {
    return filter.categories && filter.categories.length > 0
      ? filter.categories
      : undefined;
  }

  public async findAllSlug(site_user_id: string) {
    return db
      .select({ slug: blogs.slug })
      .from(blogs)
      .where(
        and(eq(blogs.site_user_id, site_user_id), isNotNull(blogs.published_at)),
      );
  }

  public async findAll() {
    return db.select().from(blogs).where(isNotNull(blogs.published_at));
  }

  public async findBySlug(slug: string, status?: ContentStatus) {
    const conditions: SQL[] = [eq(blogs.slug, slug)];
    if (status === ContentStatus.PUBLISHED) {
      conditions.push(isNotNull(blogs.published_at));
    }

    const [blog] = await db
      .select()
      .from(blogs)
      .where(and(...conditions))
      .limit(1);

    if (!blog) return null;

    const categoryRows = await db
      .select()
      .from(categoryOnBlogs)
      .where(eq(categoryOnBlogs.blog_id, blog.id));

    return {
      ...blog,
      CategoryOnBlog: categoryRows,
    };
  }

  public async findById(id: string) {
    const [result] = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id))
      .limit(1);
    return result || null;
  }

  public async findBySiteUserId(site_user_id: string) {
    const [blog] = await db
      .select()
      .from(blogs)
      .where(
        and(eq(blogs.site_user_id, site_user_id), isNotNull(blogs.published_at)),
      )
      .limit(1);

    if (!blog) return null;

    const categoryRows = await db
      .select()
      .from(categoryOnBlogs)
      .where(eq(categoryOnBlogs.blog_id, blog.id));

    return {
      ...blog,
      CategoryOnBlog: categoryRows,
    };
  }

  public async paginateAdmin(filter: BlogFilter) {
    return this.paginateBySiteUserId(undefined, filter);
  }

  public async paginateBySiteUserId(
    site_user_id: string | undefined,
    filter: BlogFilter,
    status?: ContentStatus,
  ) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.page_size ? Number(filter.page_size) : LIMIT;
    const conditions = this.buildFilter(filter);
    const categoryFilter = this.getCategoryFilter(filter);

    if (site_user_id) {
      conditions.push(eq(blogs.site_user_id, site_user_id));
    }
    if (status === ContentStatus.PUBLISHED) {
      conditions.push(isNotNull(blogs.published_at));
    }
    if (categoryFilter) {
      conditions.push(inArray(categoryOnBlogs.category_id, categoryFilter));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const results = await db
      .select({
        blog: blogs,
        categoryOnBlog: categoryOnBlogs,
        category: categories,
      })
      .from(blogs)
      .leftJoin(categoryOnBlogs, eq(blogs.id, categoryOnBlogs.blog_id))
      .leftJoin(categories, eq(categoryOnBlogs.category_id, categories.id))
      .where(whereClause)
      .orderBy(asc(blogs.created_at))
      .limit(limit)
      .offset((page - 1) * limit);

    const blogMap = new Map<string, Record<string, unknown>>();
    for (const row of results) {
      if (!blogMap.has(row.blog.id)) {
        blogMap.set(row.blog.id, {
          ...row.blog,
          CategoryOnBlog: [],
        });
      }
      if (row.categoryOnBlog && row.category) {
        (blogMap.get(row.blog.id)?.CategoryOnBlog as unknown[]).push({
          ...row.categoryOnBlog,
          category: row.category,
        });
      }
    }

    return Array.from(blogMap.values());
  }

  public async count(filter: BlogFilter, customWhere: BlogWhere = {}) {
    const conditions = this.buildFilter(filter);
    const categoryFilter = this.getCategoryFilter(filter);

    if (customWhere.site_user_id) {
      conditions.push(eq(blogs.site_user_id, customWhere.site_user_id));
    }

    if (categoryFilter) {
      const subquery = db
        .selectDistinct({ id: blogs.id })
        .from(blogs)
        .leftJoin(categoryOnBlogs, eq(blogs.id, categoryOnBlogs.blog_id))
        .where(and(...conditions, inArray(categoryOnBlogs.category_id, categoryFilter)));

      const [result] = await db
        .select({ count: count() })
        .from(subquery.as("blog_count"));
      return result.count;
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [result] = await db
      .select({ count: count() })
      .from(blogs)
      .where(whereClause);

    return result.count;
  }

  public async create(
    payload: CreateBlog,
    identity: Identity,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .insert(blogs)
      .values({
        title: payload.title,
        description: payload.description,
        cover_url: payload.cover_url,
        slug: payload.slug,
        site_user_id:
          identity.role === IdentityRole.SITE_USER ? identity.id : null,
        content: payload.content ? JSON.parse(payload.content) : null,
      })
      .returning();

    return result;
  }

  public async update(
    id: string,
    payload: CreateBlog,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(blogs)
      .set({
        title: payload.title,
        slug: payload.slug,
        cover_url: payload.cover_url,
        description: payload.description,
        content: payload.content ? JSON.parse(payload.content) : null,
      })
      .where(eq(blogs.id, id))
      .returning();

    return result;
  }

  public async delete(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client.delete(blogs).where(eq(blogs.id, id)).returning();
    return result;
  }

  public async publish(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(blogs)
      .set({ published_at: new Date() })
      .where(eq(blogs.id, id))
      .returning();

    return result;
  }

  public async unpublish(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(blogs)
      .set({ published_at: null })
      .where(eq(blogs.id, id))
      .returning();

    return result;
  }
}
