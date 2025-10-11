import { Request, Response } from "express";
import DeleteGeniallyService from "../../contexts/core/genially/application/DeleteGeniallyService";

export function deleteGeniallyControllerFactory(service: DeleteGeniallyService) {
  return async (request: Request, response: Response) => {
    await service.execute({id: request.params.id as string});
    return response.status(204).send();
  };
}
