import { LIMIT } from "@/constant/base";
import prisma from "@/loaders/prisma";
import { CategoryOnPortfolioRepository } from "@/repositories/category-on-portfolio.repository";
import { PortfolioRepository } from "@/repositories/portfolio.repository";
import type { BaseFilter } from "@/types/base.type";
import type { CreatePortfolio, PortfolioFilter } from "@/types/portfolio.type";
import { ThrowInternalServer } from "@/utils/exception";

export class PortfolioService {
  private portfolioRepository: PortfolioRepository;
  private categoryOnPortfolioRepository: CategoryOnPortfolioRepository;

  constructor() {
    this.portfolioRepository = new PortfolioRepository();
    this.categoryOnPortfolioRepository = new CategoryOnPortfolioRepository();
  }

  public async findAll() {
    return this.portfolioRepository.findAll();
  }

  public async paginate(filter: PortfolioFilter) {
    const count = await this.portfolioRepository.count(filter);
    const current_page = filter.page ? Number(filter.page) : 1;
    const page_size = filter.limit ? Number(filter.limit) : LIMIT;
    const page_count = Math.ceil(count / page_size);
    const page = count > current_page * page_size ? current_page + 1 : null;
    const portfolios = await this.portfolioRepository.paginate(filter);
    return { portfolios, page, page_count, page_size, current_page };
  }

  public async findBySlug(slug: string) {
    return this.portfolioRepository.findBySlug(slug);
  }

  public async create(payload: CreatePortfolio) {
    if (payload.categories) {
      return await prisma.$transaction(async (tx) => {
        const portfolio = await this.portfolioRepository.create(payload, tx);

        for (const category of payload.categories!) {
          await this.categoryOnPortfolioRepository.create(
            {
              category_id: category,
              portfolio_id: portfolio.id,
              assignedBy: payload.admin_id,
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

  public async update(id: string, payload: CreatePortfolio) {
    return await prisma.$transaction(async (tx) => {
      await this.categoryOnPortfolioRepository.deleteByPortfolioId(id);
      const portfolio = await this.portfolioRepository.update(id, payload, tx);
      if (payload.categories) {
        for (const category of payload.categories) {
          await this.categoryOnPortfolioRepository.create(
            {
              category_id: category,
              portfolio_id: portfolio.id,
              assignedBy: payload.admin_id,
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
