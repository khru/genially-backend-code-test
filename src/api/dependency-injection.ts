import InMemoryGeniallyRepository from "../contexts/core/genially/infrastructure/InMemoryGeniallyRepository";
import CreateGeniallyService from "../contexts/core/genially/application/CreateGeniallyService";
import { createGeniallyControllerFactory } from "./controllers/create-genially";

// Repositories
const geniallyRepository = new InMemoryGeniallyRepository();

// Services
const createGeniallyService = new CreateGeniallyService(geniallyRepository);

// Controllers
export const createGeniallyController = createGeniallyControllerFactory(createGeniallyService);
