export type Env = Record<string, string | undefined>;

export enum EnvVar {
  MONGO_URI = "MONGO_URI",
  MONGO_CONTAINER_NAME = "MONGO_CONTAINER_NAME",
  MONGO_VERSION = "MONGO_VERSION",
  MONGO_PORT = "MONGO_PORT",
  MONGO_DATABASE = "MONGO_DATABASE",
  MONGO_USERNAME = "MONGO_USERNAME",
  MONGO_PASSWORD = "MONGO_PASSWORD",
  MONGO_HOST = "MONGO_HOST",
  MONGO_COLLECTION = "MONGO_COLLECTION",
  MONGO_AUTH_SOURCE = "MONGO_AUTH_SOURCE",
  PERSISTENCE = "PERSISTENCE",
}

export const DEFAULTS: Record<EnvVar, string> = {
  [EnvVar.MONGO_URI]: "mongodb://genially_user:supersecurepassword@localhost:27017/?authSource=admin",
  [EnvVar.MONGO_CONTAINER_NAME]: "genially-db",
  [EnvVar.MONGO_VERSION]: "8.0.12",
  [EnvVar.MONGO_PORT]: "27017",
  [EnvVar.MONGO_DATABASE]: "genially",
  [EnvVar.MONGO_USERNAME]: "genially_user",
  [EnvVar.MONGO_PASSWORD]: "supersecurepassword",
  [EnvVar.MONGO_HOST]: "localhost",
  [EnvVar.MONGO_COLLECTION]: "geniallies",
  [EnvVar.MONGO_AUTH_SOURCE]: "admin",
  [EnvVar.PERSISTENCE]: "memory",
};
