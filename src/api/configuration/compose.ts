import type GeniallyRepository from "@domain/GeniallyRepository";
import CreateGeniallyService from "@application/CreateGeniallyService";
import DeleteGeniallyService from "@application/DeleteGeniallyService";
import RenameGeniallyService from "@application/RenameGeniallyService";
import { createGeniallyControllerFactory } from "@controllers/create-genially";
import { deleteGeniallyControllerFactory } from "@controllers/delete-genially";
import { renameGeniallyControllerFactory } from "@controllers/rename-genially";

export function composeControllers(repository: GeniallyRepository) {
  const createService = new CreateGeniallyService(repository);
  const deleteService = new DeleteGeniallyService(repository);
  const renameService = new RenameGeniallyService(repository);

  return {
    createGeniallyController: createGeniallyControllerFactory(createService),
    deleteGeniallyController: deleteGeniallyControllerFactory(deleteService),
    renameGeniallyController: renameGeniallyControllerFactory(renameService),
  };
}
