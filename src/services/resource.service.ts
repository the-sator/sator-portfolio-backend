import prisma from "@/loaders/prisma";
import { ResourceRepository } from "@/repositories/resource.repository";

export class ResourceService {
  private resourceRepository: ResourceRepository;
  constructor() {
    this.resourceRepository = new ResourceRepository();
  }
  public async findAll() {
    return await this.resourceRepository.findAll();
  }
}
