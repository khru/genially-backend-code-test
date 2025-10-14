import { Request, Response } from "express";
import DeleteGeniallyService from "@application/DeleteGeniallyService";
import { handleGeniallyError } from "@controllers/genially-error-mapper";

export function deleteGeniallyControllerFactory(deleteGeniallyService: DeleteGeniallyService) {
  return async (request: Request, response: Response) => {
    try {
      await deleteGeniallyService.execute({ id: request.params.id as string });
      return response.status(204).send();
    } catch (error) {
      if (handleGeniallyError(response, error)) return;
      return response.status(500).json({ error: "Internal server error" });
    }
  };
}
