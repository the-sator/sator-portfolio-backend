import { TestService } from "@/services/test.service";
import type { NextFunction, Request, Response } from "express";

export class TestController {
  private testService;
  constructor() {
    this.testService = new TestService();
  }
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.body["name"];
      const test = await this.testService.create(name);
      res.json({ test });
    } catch (err) {
      next(err);
    }
  };
}
