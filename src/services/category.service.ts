import { SiteUserAuth } from "@/authentication/site-user.auth";
import { CategoryRepository } from "@/repositories/category.repository";
import type { CreateCategory } from "@/types/category.type";
import { ThrowForbidden, ThrowUnauthorized } from "@/utils/exception";
import type { Request } from "express";

export class CategoryService {
  private categoryRepository: CategoryRepository;
  private siteUserAuth: SiteUserAuth;
  constructor() {
    this.categoryRepository = new CategoryRepository();
    this.siteUserAuth = new SiteUserAuth();
  }
  public async findAll() {
    return this.categoryRepository.findAll();
  }
  public async findBySiteUser(req: Request) {
    const { user } = await this.siteUserAuth.getSiteUser(req);
    if (!user) return ThrowUnauthorized();
    return this.categoryRepository.findBySiteUser(user.id!);
  }
  public async create(payload: CreateCategory) {
    if (!payload.admin_id && !payload.site_user_id) {
      return ThrowForbidden("Either admin_id or site_user_id is required");
    }
    return this.categoryRepository.create(payload);
  }

  public async update(id: string, payload: CreateCategory) {
    return this.categoryRepository.update(id, payload);
  }
  public async delete(id: string) {
    //TODO: May Involve Checking and Only Allow Admin Whose Created the Category to Delete or Super Admin
    return this.categoryRepository.delete(id);
  }
}
