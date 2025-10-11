import Genially from "../../../contexts/core/genially/domain/Genially";

export type GeniallyResponse = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  modifiedAt: Date | null;
  deletedAt: Date | null;
};

export function createGeniallyResponse(genially: Genially): GeniallyResponse {
  return {
    id: genially.id,
    name: genially.name,
    description: genially.description,
    createdAt: genially.createdAt,
    modifiedAt: genially.modifiedAt || null,
    deletedAt: genially.deletedAt || null
  } as GeniallyResponse;
}
