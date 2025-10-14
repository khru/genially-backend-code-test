import GeniallyRepository from "@domain/GeniallyRepository";
import { GeniallyCount } from "@domain/GeniallyCount";

export type MockedGeniallyRepository = jest.Mocked<GeniallyRepository>;

export const createGeniallyRepositoryDouble = (
  overrides: Partial<MockedGeniallyRepository> = {},
): MockedGeniallyRepository => {
  return {
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    countCreated: jest.fn().mockResolvedValue(new GeniallyCount(0)),
    ...overrides,
  };
};
