import { Request, Response } from "express";
import InMemoryGeniallyRepository from "../../contexts/core/genially/infrastructure/InMemoryGeniallyRepository";
import CreateGeniallyService from "../../contexts/core/genially/application/CreateGeniallyService";
import Genially from "../../contexts/core/genially/domain/Genially";

const geniallyRepository = new InMemoryGeniallyRepository();
const createGeniallyService = new CreateGeniallyService(geniallyRepository);

export const execute = async (request: Request, response: Response) => {
  const genially: Genially = await createGeniallyService.execute(request.body);
  response.status(201).contentType("application/json").send(
    genially
  );
};
