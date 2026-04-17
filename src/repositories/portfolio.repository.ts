import { LIMIT } from "@/constant/base";
import { IdentityRole, type Identity } from "@/core/types/base.type";
import { db, type DrizzleTransaction } from "@/db";
import {
  categories,
  categoryOnPortfolios,
  portfolioMetric,
  portfolios,
} from "@/db/schema";
import { ContentStatus } from "@/enum/content.enum";
import type { CreatePortfolio, PortfolioFilter } from "@/types/portfolio.type";
import {
  and,
  asc,
  count,
  eq,
  ilike,
  inArray,
  isNotNull,
  sql,
  type SQL,
} from "drizzle-orm";

type PortfolioWhere = {
  site_user_id?: string;
};

export class PortfolioRepository {
  public async findAll() {
    return db.select().from(portfolios);
  }

  public async findAllSlug(site_user_id: string) {
    return db
      .select({ slug: portfolios.slug })
      .from(portfolios)
      .where(
        and(
          eq(portfolios.site_user_id, site_user_id),
          isNotNull(portfolios.published_at),
        ),
      );
  }

  public buildFilter(filter: PortfolioFilter) {
    const conditions: SQL[] = [];
    if (filter.title) {
      conditions.push(ilike(portfolios.title, `%${filter.title}%`));
    }
    if (filter.published) {
      conditions.push(isNotNull(portfolios.published_at));
    }
    return conditions;
  }

  private getCategoryFilter(filter: PortfolioFilter) {
    return filter.categories
      ? Array.isArray(filter.categories)
        ? filter.categories
        : [filter.categories]
      : undefined;
  }

  public async paginateAdmin(filter: PortfolioFilter) {
    return this.paginateBySiteUserId(undefined, filter);
  }

  public async paginateBySiteUserId(
    site_user_id: string | undefined,
    filter: PortfolioFilter,
    status?: ContentStatus,
  ) {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = filter.page_size ? Number(filter.page_size) : LIMIT;
    const conditions = this.buildFilter(filter);
    const categoryFilter = this.getCategoryFilter(filter);

    if (site_user_id) {
      conditions.push(eq(portfolios.site_user_id, site_user_id));
    }
    if (status === ContentStatus.PUBLISHED) {
      conditions.push(isNotNull(portfolios.published_at));
    }
    if (categoryFilter && categoryFilter.length > 0) {
      conditions.push(
        inArray(categoryOnPortfolios.category_id, categoryFilter),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const results = await db
      .select({
        portfolio: portfolios,
        categoryOnPortfolio: categoryOnPortfolios,
        category: categories,
      })
      .from(portfolios)
      .leftJoin(
        categoryOnPortfolios,
        eq(portfolios.id, categoryOnPortfolios.portfolio_id),
      )
      .leftJoin(categories, eq(categoryOnPortfolios.category_id, categories.id))
      .where(whereClause)
      .orderBy(asc(portfolios.created_at))
      .limit(limit)
      .offset((page - 1) * limit);

    const portfolioMap = new Map<string, Record<string, unknown>>();
    for (const row of results) {
      if (!portfolioMap.has(row.portfolio.id)) {
        portfolioMap.set(row.portfolio.id, {
          ...row.portfolio,
          CategoryOnPorfolio: [],
        });
      }
      if (row.categoryOnPortfolio && row.category) {
        (portfolioMap.get(row.portfolio.id)?.CategoryOnPorfolio as unknown[]).push({
          ...row.categoryOnPortfolio,
          category: row.category,
        });
      }
    }

    return Array.from(portfolioMap.values());
  }

  public async findBySlug(slug: string, status?: ContentStatus) {
    const conditions: SQL[] = [eq(portfolios.slug, slug)];
    if (status === ContentStatus.PUBLISHED) {
      conditions.push(isNotNull(portfolios.published_at));
    }

    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(and(...conditions))
      .limit(1);

    if (!portfolio) return null;

    const [categoryRows, viewRows] = await Promise.all([
      db
        .select({
          categoryOnPortfolio: categoryOnPortfolios,
          category: categories,
        })
        .from(categoryOnPortfolios)
        .leftJoin(
          categories,
          eq(categoryOnPortfolios.category_id, categories.id),
        )
        .where(eq(categoryOnPortfolios.portfolio_id, portfolio.id)),
      db
        .select({
          view: sql<number>`COALESCE(SUM(${portfolioMetric.view}), 0)::int`,
        })
        .from(portfolioMetric)
        .where(eq(portfolioMetric.portfolio_id, portfolio.id)),
    ]);

    return {
      ...portfolio,
      CategoryOnPorfolio: categoryRows.map((row) => ({
        ...row.categoryOnPortfolio,
        category: row.category,
      })),
      view: viewRows[0]?.view ?? 0,
    };
  }

  public async findById(id: string) {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, id))
      .limit(1);

    if (!portfolio) return null;

    const categoryRows = await db
      .select({
        categoryOnPortfolio: categoryOnPortfolios,
        category: categories,
      })
      .from(categoryOnPortfolios)
      .leftJoin(categories, eq(categoryOnPortfolios.category_id, categories.id))
      .where(eq(categoryOnPortfolios.portfolio_id, portfolio.id));

    return {
      ...portfolio,
      CategoryOnPorfolio: categoryRows.map((row) => ({
        ...row.categoryOnPortfolio,
        category: row.category,
      })),
    };
  }

  public async count(filter: PortfolioFilter, customWhere: PortfolioWhere = {}) {
    const conditions = this.buildFilter(filter);
    const categoryFilter = this.getCategoryFilter(filter);

    if (customWhere.site_user_id) {
      conditions.push(eq(portfolios.site_user_id, customWhere.site_user_id));
    }

    if (categoryFilter && categoryFilter.length > 0) {
      const subquery = db
        .selectDistinct({ id: portfolios.id })
        .from(portfolios)
        .leftJoin(
          categoryOnPortfolios,
          eq(portfolios.id, categoryOnPortfolios.portfolio_id),
        )
        .where(
          and(
            ...conditions,
            inArray(categoryOnPortfolios.category_id, categoryFilter),
          ),
        );

      const [result] = await db
        .select({ count: count() })
        .from(subquery.as("portfolio_count"));
      return result.count;
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [result] = await db
      .select({ count: count() })
      .from(portfolios)
      .where(whereClause);

    return result.count;
  }

  public async create(
    payload: CreatePortfolio,
    identity: Identity,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const values = {
      site_user_id:
        identity.role === IdentityRole.SITE_USER ? identity.id : null,
      description: payload.description,
      cover_url: payload.cover_url,
      content: payload.content ? JSON.parse(payload.content) : null,
      gallery: payload.gallery ?? [],
      title: payload.title,
      slug: payload.slug,
      github_link: payload.github_link,
      preview_link: payload.preview_link,
    };

    const [result] = await client
      .insert(portfolios)
      .values(values)
      .onConflictDoUpdate({
        target: portfolios.slug,
        set: values,
      })
      .returning();

    return result;
  }

  public async update(
    id: string,
    payload: CreatePortfolio,
    identity: Identity,
    tx?: DrizzleTransaction,
  ) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(portfolios)
      .set({
        site_user_id:
          identity.role === IdentityRole.SITE_USER ? identity.id : null,
        description: payload.description,
        cover_url: payload.cover_url,
        content: payload.content ? JSON.parse(payload.content) : null,
        gallery: payload.gallery,
        title: payload.title,
        github_link: payload.github_link,
        preview_link: payload.preview_link,
        slug: payload.slug,
      })
      .where(eq(portfolios.id, id))
      .returning();

    return result;
  }

  public async delete(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .delete(portfolios)
      .where(eq(portfolios.id, id))
      .returning();
    return result;
  }

  public async publish(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(portfolios)
      .set({ published_at: new Date() })
      .where(eq(portfolios.id, id))
      .returning();
    return result;
  }

  public async unpublish(id: string, tx?: DrizzleTransaction) {
    const client = tx ? tx : db;
    const [result] = await client
      .update(portfolios)
      .set({ published_at: null })
      .where(eq(portfolios.id, id))
      .returning();
    return result;
  }
}
