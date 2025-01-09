import { AdminAuth } from "@/authentication/admin.auth";
import { SiteUserAuth } from "@/authentication/site-user.auth";
import { CategoryRepository } from "@/repositories/category.repository";
import type { CreateCategory } from "@/types/category.type";
import { ThrowForbidden, ThrowUnauthorized } from "@/utils/exception";
import type { Request } from "express";

export class CategoryService {
  private categoryRepository: CategoryRepository;
  private siteUserAuth: SiteUserAuth;
  private adminAuth: AdminAuth;
  constructor() {
    this.categoryRepository = new CategoryRepository();
    this.siteUserAuth = new SiteUserAuth();
    this.adminAuth = new AdminAuth();
  }
  public async findAll() {
    return this.categoryRepository.findAll();
  }
  public async findBySiteUser(req: Request) {
    const { auth } = await this.siteUserAuth.getSiteUser(req);
    if (!auth) return ThrowUnauthorized();
    return this.categoryRepository.findBySiteUser(auth.id!);
  }
  public async create(req: Request, payload: CreateCategory) {
    const isAdmin = req.originalUrl.startsWith("/api/admin");
    const { auth } = isAdmin
      ? await this.adminAuth.getAdmin(req)
      : await this.siteUserAuth.getSiteUser(req);
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
