import { Request, Response } from "express";
import DeleteGeniallyService from "../../contexts/core/genially/application/DeleteGeniallyService";
import GeniallyNotExist from "../../contexts/core/genially/domain/exception/GeniallyNotExist";
import GeniallyAlreadyDeleted from "../../contexts/core/genially/domain/exception/GeniallyAlreadyDeleted";

export function deleteGeniallyControllerFactory(service: DeleteGeniallyService) {
  return async (request: Request, response: Response) => {
    try {

      await service.execute({id: request.params.id as string});
      return response.status(204).send();

    } catch (error) {
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
