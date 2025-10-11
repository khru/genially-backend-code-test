import { Request, Response } from "express";
import InMemoryGeniallyRepository from "../../contexts/core/genially/infrastructure/InMemoryGeniallyRepository";
import CreateGeniallyService from "../../contexts/core/genially/application/CreateGeniallyService";
import Genially from "../../contexts/core/genially/domain/Genially";

const geniallyRepository = new InMemoryGeniallyRepository();
const createGeniallyService = new CreateGeniallyService(geniallyRepository);

type CreateGeniallyResponse = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  modifiedAt: string;
  deletedAt: string;
}
export const execute = async (request: Request, response: Response) => {
  const genially: Genially = await createGeniallyService.execute(request.body);
  const geniallyResponse: CreateGeniallyResponse = {
    id: genially.id,
    name: genially.name,
    description: genially.description,
    createdAt: genially.createdAt.toISOString(),
    modifiedAt: genially.modifiedAt?.toISOString() || null,
    deletedAt: genially.deletedAt?.toISOString() || null
  };
  response.status(201).contentType("application/json").send(
    geniallyResponse
  );
};
