import { Request, Response } from "express";
import RenameGeniallyService from "@application/RenameGeniallyService";

import { InvalidGeniallyNameError } from "@domain/exception/InvalidGeniallyNameError";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import { createGeniallyResponse, GeniallyResponse } from "@infrastructure/responses/GeniallyResponse";

export function renameGeniallyControllerFactory(renameGeniallyService: RenameGeniallyService) {
  return async (request: Request, response: Response) => {
    const {name} = request.body;
    if (!name) {
      return response.status(400).json({error: "Field 'name' is required"});
    }

    try {
      const genially = await renameGeniallyService.execute({id: request.params.id as string, name});

      const body: GeniallyResponse = createGeniallyResponse(genially);
      return response.status(200).contentType("application/json").send(body);
    } catch (error) {
      if (error instanceof InvalidGeniallyNameError) {
        return response.status(400).json({error: error.message});
      }

      if (error instanceof GeniallyNotExist) {
        return response.status(404).json({error: error.message});
      }

      if (error instanceof GeniallyAlreadyDeleted) {
        return response.status(412).json({error: error.message});
      }

      return response.status(500).json({error: "Internal server error"});
    }
  };
}
