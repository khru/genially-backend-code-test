import InMemoryGeniallyRepository from "@infrastructure/InMemoryGeniallyRepository";
import CreateGeniallyService from "@application/CreateGeniallyService";
import { createGeniallyControllerFactory } from "@controllers/create-genially";
import DeleteGeniallyService from "@application/DeleteGeniallyService";
import { deleteGeniallyControllerFactory } from "@controllers/delete-genially";
import RenameGeniallyService from "@application/RenameGeniallyService";
import { renameGeniallyControllerFactory } from "@controllers/rename-genially";

// Repositories
const geniallyRepository = new InMemoryGeniallyRepository();

// Services
const createGeniallyService = new CreateGeniallyService(geniallyRepository);
const deleteGeniallyService = new DeleteGeniallyService(geniallyRepository);
const renameGeniallyService = new RenameGeniallyService(geniallyRepository);

// Controllers
export const createGeniallyController = createGeniallyControllerFactory(createGeniallyService);
export const deleteGeniallyController = deleteGeniallyControllerFactory(deleteGeniallyService);
export const renameGeniallyController = renameGeniallyControllerFactory(renameGeniallyService);
