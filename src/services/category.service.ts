import { CategoryRepository } from "@/repositories/category.repository";
import type { CreateCategory } from "@/types/category.type";
import type { Request } from "express";
import { SiteUserService } from "../modules/site-user/site-user.service";
import { UnauthorizedException } from "@/core/response/error/exception";
import { cookie, COOKIE_ENTITY } from "@/libs/cookie";

export class CategoryService {
  private categoryRepository: CategoryRepository;
  private siteUserService: SiteUserService;
  constructor() {
    this.categoryRepository = new CategoryRepository();
    this.siteUserService = new SiteUserService();
  }
  public async findAll() {
    return this.categoryRepository.findAll();
  }
  public async findBySiteUser(req: Request) {
    const sessionToken = cookie.get(req, COOKIE_ENTITY.SITE_USER);
    const siteUser = await this.siteUserService.getMe(sessionToken);
    if (!siteUser) throw new UnauthorizedException();
    return this.categoryRepository.findBySiteUser(siteUser.id as string);
  }
  public async create(req: Request, payload: CreateCategory) {
    const sessionToken = cookie.get(req, COOKIE_ENTITY.SITE_USER);
    const site_user = await this.siteUserService.getMe(sessionToken);
    if (!site_user) throw new UnauthorizedException();
    return this.categoryRepository.create(site_user.id as string, payload);
  }

  public async update(id: string, payload: CreateCategory) {
    return this.categoryRepository.update(id, payload);
  }
  public async delete(id: string) {
    //TODO: May Involve Checking and Only Allow Admin Whose Created the Category to Delete or Super Admin
    return this.categoryRepository.delete(id);
  }
}
