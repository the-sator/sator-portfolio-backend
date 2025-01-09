import { SiteUserAuth } from "@/authentication/site-user.auth";
import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import { CategoryOnPortfolioRepository } from "@/repositories/category-on-portfolio.repository";
import { PortfolioRepository } from "@/repositories/portfolio.repository";
import type { BaseFilter } from "@/types/base.type";
import type { CreatePortfolio, PortfolioFilter } from "@/types/portfolio.type";
import {
  ThrowForbidden,
  ThrowInternalServer,
  ThrowUnauthorized,
} from "@/utils/exception";
import { getPaginationMetadata } from "@/utils/pagination";
import type { Request } from "express";

export class PortfolioService {
  private portfolioRepository: PortfolioRepository;
  private categoryOnPortfolioRepository: CategoryOnPortfolioRepository;
  private siteUserAuth: SiteUserAuth;

  constructor() {
    this.portfolioRepository = new PortfolioRepository();
    this.categoryOnPortfolioRepository = new CategoryOnPortfolioRepository();
    this.siteUserAuth = new SiteUserAuth();
  }

  public async findAll() {
    return this.portfolioRepository.findAll();
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

  public async paginateBySiteUser(req: Request, filter: PortfolioFilter) {
    const { auth } = await this.siteUserAuth.getSiteUser(req);
    if (!auth) return ThrowUnauthorized();
    const count = await this.portfolioRepository.count(filter, {
      site_user_id: auth.id,
    });
    const { current_page, page, page_count, page_size } = getPaginationMetadata(
      filter,
      count
    );
    const portfolios = await this.portfolioRepository.paginateBySiteUserId(
      auth.id,
      filter
    );

    return {
      data: portfolios,
      metadata: { page, page_count, page_size, current_page },
    };
  }

  public async findBySlug(slug: string) {
    return this.portfolioRepository.findBySlug(slug);
  }

  public async create(payload: CreatePortfolio) {
    if (!payload.admin_id && !payload.site_user_id) return ThrowForbidden();
    if (payload.categories) {
      return await prisma.$transaction(async (tx) => {
        const portfolio = await this.portfolioRepository.create(payload, tx);

        for (const category of payload.categories!) {
          const assignedBy = payload.admin_id || payload.site_user_id || "";
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
    const portfolio = await this.portfolioRepository.create(payload);
    return portfolio;
  }

  public async update(id: string, payload: CreatePortfolio, req: Request) {
    return await prisma.$transaction(async (tx) => {
      if (payload.site_user_id) {
        const { auth } = await this.siteUserAuth.getSiteUser(req);
        if (!auth) return ThrowUnauthorized();
        const portfolio = await this.portfolioRepository.findById(id);
        if (!portfolio) return ThrowInternalServer();
        if (portfolio.site_user_id !== auth.id) return ThrowForbidden();
      }
      await this.categoryOnPortfolioRepository.deleteByPortfolioId(id);
      const portfolio = await this.portfolioRepository.update(id, payload, tx);
      if (payload.categories) {
        for (const category of payload.categories) {
          const assignedBy = payload.admin_id || payload.site_user_id || "";
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

  public async delete(id: string) {
    return this.portfolioRepository.delete(id);
  }

  public async publish(id: string) {
    return this.portfolioRepository.publish(id);
  }

  public async unpublish(id: string) {
    return this.portfolioRepository.unpublish(id);
  }
}
