export type PersistenceType = "memory" | "mongo";
export type ConnectionInformation = { uri: string; dbName: string; collection: string };

export type AppConfig = {
  database: ConnectionInformation;
};
