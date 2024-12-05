import { CategoryRepository } from "@/repositories/category.repository";
import type { CreateCategory } from "@/types/category.type";

export class CategoryService {
  private categoryRepository: CategoryRepository;
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }
  public async findAll() {
    return this.categoryRepository.findAll();
  }
  public async create(payload: CreateCategory) {
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
