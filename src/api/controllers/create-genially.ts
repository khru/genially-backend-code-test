import { Request, Response } from "express";
import CreateGeniallyService from "@application/CreateGeniallyService";
import Genially from "@domain/Genially";
import { createGeniallyResponse, GeniallyResponse } from "@infrastructure/responses/GeniallyResponse";
import { mapGeniallyDomainErrorToHttpError } from "@controllers/genially-error-mapper";

export function createGeniallyControllerFactory(createGeniallyService: CreateGeniallyService) {
  return async (request: Request, response: Response) => {
    const { id, name } = request.body;

    if (!id) {
      return response.status(400).json({ error: "Field 'id' is required" });
    }

    if (!name) {
      return response.status(400).json({ error: "Field 'name' is required" });
    }

    try {
      const genially: Genially = await createGeniallyService.execute(request.body);
      const geniallyResponse: GeniallyResponse = createGeniallyResponse(genially);
      response.status(201).json(geniallyResponse);
    } catch (error) {
      const mappedError = mapGeniallyDomainErrorToHttpError(error);
      if (mappedError) {
        return response.status(mappedError.status).json(mappedError.body);
      }

      return response.status(500).json({
        error: `Internal server error: ${JSON.stringify(error)}`,
      });
    }
  };
}
