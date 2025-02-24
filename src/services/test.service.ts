import { TestRepository } from "@/repositories/test.repository";

export class TestService {
  private testRepository;
  constructor() {
    this.testRepository = new TestRepository();
  }

  public getAll() {
    return this.testRepository.getAll();
  }
  public create(name: string) {
    return this.testRepository.create(name);
  }
  public update(id: string, name: string) {
    return this.testRepository.update(id, name);
  }
}
