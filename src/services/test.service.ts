import { TestRepository } from "@/repositories/test.repository";

export class TestService {
  private testRepository;
  constructor() {
    this.testRepository = new TestRepository();
  }

  public create(name: string) {
    return this.testRepository.create(name);
  }
}
