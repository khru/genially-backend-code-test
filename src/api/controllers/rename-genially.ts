import { Request, Response } from "express";
import RenameGeniallyService from "../../contexts/core/genially/application/RenameGeniallyService";
import { createGeniallyResponse, GeniallyResponse } from "./responses/GeniallyResponse";
import { InvalidGeniallyNameError } from "../../contexts/core/genially/domain/exception/InvalidGeniallyNameError";
import GeniallyAlreadyDeleted from "../../contexts/core/genially/domain/exception/GeniallyAlreadyDeleted";
import GeniallyNotExist from "../../contexts/core/genially/domain/exception/GeniallyNotExist";


export function renameGeniallyControllerFactory(service: RenameGeniallyService) {
  return async (request: Request, response: Response) => {
    const {name} = request.body;
    if (!name) {
      return response.status(400).json({error: "Field 'name' is required"});
    }

    try {
      const genially = await service.execute({id: request.params.id as string, name});

      const body: GeniallyResponse = createGeniallyResponse(genially);
      return response
        .status(200)
        .contentType("application/json")
        .send(body);

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
