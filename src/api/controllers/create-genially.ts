import { Request, Response } from "express";
import InMemoryGeniallyRepository from "../../contexts/core/genially/infrastructure/InMemoryGeniallyRepository";
import CreateGeniallyService from "../../contexts/core/genially/application/CreateGeniallyService";
import Genially from "../../contexts/core/genially/domain/Genially";
import GeniallyValidationError from "../../contexts/core/genially/domain/GeniallyValidationError";

const geniallyRepository = new InMemoryGeniallyRepository();
const createGeniallyService = new CreateGeniallyService(geniallyRepository);

type CreateGeniallyResponse = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string;
};

export const execute = async (request: Request, response: Response) => {
  const {id, name} = request.body;

  if (!id) {
    return response.status(400).json({error: "Field 'id' is required"});
  }

  if (!name) {
    return response.status(400).json({error: "Field 'name' is required"});
  }

  try {
    const genially: Genially = await createGeniallyService.execute(request.body);
    const geniallyResponse: CreateGeniallyResponse = createGeniallyResponse(genially);
    response.status(201)
      .contentType("application/json")
      .send(geniallyResponse);
  } catch (error) {
    if (error instanceof GeniallyValidationError) {
      return response.status(400).json({
        error: error.message,
        details: error.errors
      });
    }

    return response.status(500).json({
      error: "Internal server error"
    });
  }


};

function createGeniallyResponse(genially: Genially): CreateGeniallyResponse {
  return {
    id: genially.id,
    name: genially.name,
    description: genially.description,
    createdAt: genially.createdAt.toISOString(),
    modifiedAt: genially.modifiedAt?.toISOString() || null,
    deletedAt: genially.deletedAt?.toISOString() || null
  } as CreateGeniallyResponse;
}
