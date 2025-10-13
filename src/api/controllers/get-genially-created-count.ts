import { Request, Response } from "express";
import type { GeniallyCountResponse } from "@infrastructure/responses/GeniallyCountResponse";
import GeniallyCreatedCountService from "@application/GeniallyCreatedCountService";

export function getGeniallyCreatedCountControllerFactory(
  geniallyCreatedCountService: GeniallyCreatedCountService
) {
  return async (_req: Request, response: Response) => {
    const totalGeniallyCreated: GeniallyCountResponse = await geniallyCreatedCountService.execute();
    response.status(200).json(totalGeniallyCreated);
  };
}
