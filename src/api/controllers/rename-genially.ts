import { Request, Response } from "express";
import RenameGeniallyService from "@application/RenameGeniallyService";

import { createGeniallyResponse, GeniallyResponse } from "@infrastructure/responses/GeniallyResponse";
import { mapGeniallyError } from "@controllers/genially-error-mapper";

export function renameGeniallyControllerFactory(renameGeniallyService: RenameGeniallyService) {
  return async (request: Request, response: Response) => {
    const { name } = request.body;
    if (!name) {
      return response.status(400).json({ error: "Field 'name' is required" });
    }

    try {
      const genially = await renameGeniallyService.execute({ id: request.params.id as string, name });

      const body: GeniallyResponse = createGeniallyResponse(genially);
      return response.status(200).json(body);
    } catch (error) {
      const mappedError = mapGeniallyError(error);
      if (mappedError) {
        return response.status(mappedError.status).json(mappedError.body);
      }

      return response.status(500).json({ error: "Internal server error" });
    }
  };
}
