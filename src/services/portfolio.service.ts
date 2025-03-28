import prisma from "@/loaders/prisma";
import { CategoryOnPortfolioRepository } from "@/repositories/category-on-portfolio.repository";
import { PortfolioRepository } from "@/repositories/portfolio.repository";
import type { CreatePortfolio, PortfolioFilter } from "@/types/portfolio.type";
import {
  ThrowForbidden,
  ThrowInternalServer,
  ThrowUnauthorized,
} from "@/utils/exception";
import { getPaginationMetadata } from "@/utils/pagination";
import type { Request } from "express";
import { SiteUserService } from "./site-user.service";
import { getSiteUserCookie } from "@/utils/cookie";
import { SiteUserRepository } from "@/repositories/site-user.repository";
import { PortfolioMetricRepository } from "@/repositories/portfolio-metric.repository";
import { IdentityRole, type Identity } from "@/types/base.type";
import { AdminService } from "./admin.service";
import { ContentStatus } from "@/enum/content.enum";

export class PortfolioService {
  private portfolioRepository: PortfolioRepository;
  private categoryOnPortfolioRepository: CategoryOnPortfolioRepository;
  private siteUserRepository: SiteUserRepository;
  private siteUserService: SiteUserService;
  private adminService: AdminService;
  private portfolioMetricRepository: PortfolioMetricRepository;

  constructor() {
    this.portfolioRepository = new PortfolioRepository();
    this.categoryOnPortfolioRepository = new CategoryOnPortfolioRepository();
    this.siteUserService = new SiteUserService();
    this.adminService = new AdminService();
    this.siteUserRepository = new SiteUserRepository();
    this.portfolioMetricRepository = new PortfolioMetricRepository();
  }

  public async findAll() {
    return this.portfolioRepository.findAll();
  }

  public async getAllSlugBySiteUser(key: string) {
    const siteUser = await this.siteUserRepository.findByApiKey(key);
    if (!siteUser) return ThrowUnauthorized();
    const slugs = await this.portfolioRepository.findAllSlug(siteUser.id);
    return slugs.map((slug) => {
      return slug.slug;
    });
  }

  public async paginateByAdmin(filter: PortfolioFilter) {
    const count = await this.portfolioRepository.count(filter);
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const portfolios = await this.portfolioRepository.paginateAdmin(filter);
    return {
      data: portfolios,
      metadata: { page, page_count, page_size, current_page },
    };
  }
  //======================
  //====== Site User =====

  public async paginateBySiteUser(req: Request, filter: PortfolioFilter) {
    const sessionToken = getSiteUserCookie(req);
    const siteUser = await this.siteUserService.getMe(sessionToken);
    if (!siteUser) return ThrowUnauthorized();
    const count = await this.portfolioRepository.count(filter, {
      site_user_id: siteUser.id,
    });
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const portfolios = await this.portfolioRepository.paginateBySiteUserId(
      siteUser.id,
      filter
    );

    return {
      data: portfolios,
      metadata: { page, page_count, page_size, current_page },
    };
  }

  public async paginateBySiteUserApiKey(key: string, filter: PortfolioFilter) {
    const siteUser = await this.siteUserRepository.findByApiKey(key);
    if (!siteUser) return ThrowUnauthorized();
    const count = await this.portfolioRepository.count(filter, {
      site_user_id: siteUser.id,
    });
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const publishedFilter = {
      ...filter,
      published_at: {
        not: null,
      },
    };
    const portfolios = await this.portfolioRepository.paginateBySiteUserId(
      siteUser.id,
      publishedFilter,
      ContentStatus.PUBLISHED
    );
    return {
      data: portfolios,
      metadata: { page, page_count, page_size, current_page },
    };
  }

  public async getBySlug(slug: string) {
    return await this.portfolioRepository.findBySlug(slug);
  }

  public async getPublishedBySlug(slug: string) {
    return await this.portfolioRepository.findBySlug(
      slug,
      ContentStatus.PUBLISHED
    );
  }

  public async create(
    token: string,
    payload: CreatePortfolio,
    role: IdentityRole
  ) {
    let identity: Identity;
    if (role === IdentityRole.ADMIN) {
      const admin = await this.adminService.getMe(token);
      identity = {
        id: admin.id,
        role: IdentityRole.ADMIN,
      };
    } else if (role === IdentityRole.SITE_USER) {
      const siteUser = await this.siteUserService.getMe(token);
      identity = {
        id: siteUser.id,
        role: IdentityRole.SITE_USER,
      };
    } else {
      return ThrowInternalServer();
    }
    // if (!payload.admin_id && !payload.site_user_id) return ThrowForbidden();
    if (payload.categories) {
      return await prisma.$transaction(async (tx) => {
        const portfolio = await this.portfolioRepository.create(
          payload,
          identity,
          tx
        );

        for (const category of payload.categories!) {
          const assignedBy = identity.id || "";
          await this.categoryOnPortfolioRepository.create(
            {
              category_id: category,
              portfolio_id: portfolio.id,
              assignedBy,
            },
            tx
          );
        }
        return portfolio;
      });
    }
    const portfolio = await this.portfolioRepository.create(payload, identity);
    return portfolio;
  }

  public async update(
    token: string,
    id: string,
    payload: CreatePortfolio,
    role: IdentityRole
  ) {
    let identity: Identity;
    if (role === IdentityRole.ADMIN) {
      const admin = await this.adminService.getMe(token);
      identity = {
        id: admin.id,
        role: IdentityRole.ADMIN,
      };
    } else if (role === IdentityRole.SITE_USER) {
      const siteUser = await this.siteUserService.getMe(token);
      identity = {
        id: siteUser.id,
        role: IdentityRole.SITE_USER,
      };
    } else {
      return ThrowInternalServer();
    }
    return await prisma.$transaction(async (tx) => {
      await this.categoryOnPortfolioRepository.deleteByPortfolioId(id);
      const portfolio = await this.portfolioRepository.update(
        id,
        payload,
        identity,
        tx
      );
      if (payload.categories) {
        for (const category of payload.categories) {
          const assignedBy = identity.id;
          await this.categoryOnPortfolioRepository.create(
            {
              category_id: category,
              portfolio_id: portfolio.id,
              assignedBy,
            },
            tx
          );
        }
      }
      return portfolio;
    });
  }

  public async increaseView(key: string, slug: string) {
    const siteUser = await this.siteUserRepository.findByApiKey(key);
    if (!siteUser) return ThrowUnauthorized();
    const portfolio = await this.portfolioRepository.findBySlug(slug);
    if (!portfolio) return ThrowForbidden("No Record Found");
    return await prisma.$transaction(async (tx) => {
      const portfolioMetric = await this.portfolioMetricRepository.findByToday(
        portfolio.id,
        tx
      );
      //If not found, then create new portfolio metric
      if (!portfolioMetric) {
        await this.portfolioMetricRepository.createMetric(portfolio.id, tx);
        return portfolio;
      }
      await this.portfolioMetricRepository.increaseView(portfolioMetric.id, tx);
      return portfolio;
    });
  }

  public async publish(id: string) {
    return this.portfolioRepository.publish(id);
  }

  public async unpublish(id: string) {
    return this.portfolioRepository.unpublish(id);
  }

  public async delete(id: string) {
    return this.portfolioRepository.delete(id);
  }
}
