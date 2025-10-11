export default class GeniallyAlreadyDeleted extends Error {
  constructor(id: string) {
    super(`Genially <${id}> does no exist`);
  }
}
