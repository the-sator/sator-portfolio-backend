import { TestService } from "@/services/test.service";
import type { NextFunction, Request, Response } from "express";

export class TestController {
  private testService;
  constructor() {
    this.testService = new TestService();
  }
  public getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const test = await this.testService.getAll();
      res.json({ data: test });
    } catch (err) {
      next(err);
    }
  };
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.body["name"];
      const test = await this.testService.create(name);
      res.json({ data: test });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const param = req.params;
      const name = req.body["name"];
      const test = await this.testService.update(param.id, name);
      res.json({ data: test });
    } catch (err) {
      next(err);
    }
  };
}
