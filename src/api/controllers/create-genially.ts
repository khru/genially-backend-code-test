import { Request, Response } from 'express';
import CreateGeniallyService from '@application/CreateGeniallyService';
import Genially from '@domain/Genially';
import GeniallyValidationError from '@domain/exception/GeniallyValidationError';
import { createGeniallyResponse, GeniallyResponse } from '@controllers/responses/GeniallyResponse';

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
      response.status(201).contentType('application/json').send(geniallyResponse);
    } catch (error) {
      if (error instanceof GeniallyValidationError) {
        return response.status(400).json({
          error: error.message,
          details: error.errors,
        });
      }

      return response.status(500).json({
        error: 'Internal server error',
      });
    }
  };
}
