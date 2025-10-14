import { Request, Response } from "express";
import DeleteGeniallyService from "@application/DeleteGeniallyService";
import { mapGeniallyError } from "@controllers/genially-error-mapper";

export function deleteGeniallyControllerFactory(deleteGeniallyService: DeleteGeniallyService) {
  return async (request: Request, response: Response) => {
    try {
      await deleteGeniallyService.execute({ id: request.params.id as string });
      return response.status(204).send();
    } catch (error) {
      const mappedError = mapGeniallyError(error);
      if (mappedError) {
        return response.status(mappedError.status).json(mappedError.body);
      }
      return response.status(500).json({ error: "Internal server error" });
    }
  };
}
