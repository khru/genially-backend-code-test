export default class GeniallyAlreadyDeleted extends Error {
  constructor(id: string) {
    super(`Genially <${id}> is already deleted`);
  }
}
