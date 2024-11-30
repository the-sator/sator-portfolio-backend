import { PortfolioRepository } from "@/repositories/portfolio.repository";
import type { CreatePortfolio } from "@/types/portfolio.type";

export class PortfolioService {
  private portfolioRepository: PortfolioRepository;
  constructor() {
    this.portfolioRepository = new PortfolioRepository();
  }
  public async findAll() {
    return this.portfolioRepository.findAll();
  }
  public async findBySlug(slug: string) {
    return this.portfolioRepository.findBySlug(slug);
  }
  public async create(payload: CreatePortfolio) {
    return this.portfolioRepository.create(payload);
  }
}
