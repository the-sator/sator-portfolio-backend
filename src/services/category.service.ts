import { CategoryRepository } from "@/repositories/category.repository";
import type { CreateCategory } from "@/types/category.type";
import { ThrowUnauthorized } from "@/utils/exception";
import type { Request } from "express";
import { SiteUserService } from "./site-user.service";
import { AdminService } from "./admin.service";
import { getAdminCookie, getSiteUserCookie } from "@/utils/cookie";
import config from "@/config/environment";

export class CategoryService {
  private categoryRepository: CategoryRepository;
  private siteUserService: SiteUserService;
  private adminService: AdminService;
  constructor() {
    this.categoryRepository = new CategoryRepository();
    this.siteUserService = new SiteUserService();
    this.adminService = new AdminService();
  }
  public async findAll() {
    return this.categoryRepository.findAll();
  }
  public async findBySiteUser(req: Request) {
    const sessionToken = getSiteUserCookie(req);
    const siteUser = await this.siteUserService.getMe(sessionToken);
    if (!siteUser) return ThrowUnauthorized();
    return this.categoryRepository.findBySiteUser(siteUser.id!);
  }
  public async create(req: Request, payload: CreateCategory) {
    const isAdmin = req.originalUrl.startsWith(`${config.api.prefix}/admin`);
    const sessionToken = isAdmin ? getAdminCookie(req) : getSiteUserCookie(req);
    const auth = isAdmin
      ? await this.adminService.getMe(sessionToken)
      : await this.siteUserService.getMe(sessionToken);
    if (!auth) return ThrowUnauthorized();
    return this.categoryRepository.create(auth.id, isAdmin, payload);
  }

  public async update(id: string, payload: CreateCategory) {
    return this.categoryRepository.update(id, payload);
  }
  public async delete(id: string) {
    //TODO: May Involve Checking and Only Allow Admin Whose Created the Category to Delete or Super Admin
    return this.categoryRepository.delete(id);
  }
}
