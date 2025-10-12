import type { AppConfig, PersistenceType } from '@configuration/app-config';
import { DEFAULTS, Env, EnvVar } from '@configuration/env';
import { PersistenceTypes } from '@configuration/persistence-types';

export class ConfigFactory {
  private static readonly _emptyString = '';
  private static readonly _stringType = 'string';

  private static readKnown(sourceEnv: Env, key: EnvVar): string | undefined {
    return sourceEnv[key];
  }

  private static trimToEmpty(value?: string): string {
    return typeof value === ConfigFactory._stringType ? value.trim() : ConfigFactory._emptyString;
  }

  private static isNonEmpty(text: string): boolean {
    return text.length > 0;
  }

  private static withDefaultIfEmpty(value: string, key: EnvVar): string {
    return ConfigFactory.isNonEmpty(value) ? value : DEFAULTS[key];
  }

  private static resolveKnownVar(sourceEnv: Env, key: EnvVar): string {
    const raw = ConfigFactory.readKnown(sourceEnv, key);
    const normalized = ConfigFactory.trimToEmpty(raw);
    return ConfigFactory.withDefaultIfEmpty(normalized, key);
  }

  private static resolveKnownEnv(sourceEnv: Env): Record<EnvVar, string> {
    const resolved = {} as Record<EnvVar, string>;
    for (const key of Object.values(EnvVar) as EnvVar[]) {
      resolved[key] = ConfigFactory.resolveKnownVar(sourceEnv, key);
    }
    return resolved;
  }

  private static parsePersistence(input?: string): PersistenceType {
    const normalized = ConfigFactory.trimToEmpty(input).toLowerCase();
    return normalized === PersistenceTypes.MONGO ? PersistenceTypes.MONGO : PersistenceTypes.MEMORY;
  }

  private static explicitMongoHost(sourceEnv: Env): string | undefined {
    const normalized = ConfigFactory.trimToEmpty(sourceEnv[EnvVar.MONGO_HOST]);
    return ConfigFactory.isNonEmpty(normalized) ? normalized : undefined;
  }

  private static explicitContainerName(sourceEnv: Env): string | undefined {
    const normalized = ConfigFactory.trimToEmpty(sourceEnv[EnvVar.MONGO_CONTAINER_NAME]);
    return ConfigFactory.isNonEmpty(normalized) ? normalized : undefined;
  }

  private static chooseMongoHost(sourceEnv: Env, resolvedEnv: Record<EnvVar, string>): string {
    return (
      ConfigFactory.explicitMongoHost(sourceEnv) ??
      ConfigFactory.explicitContainerName(sourceEnv) ??
      resolvedEnv[EnvVar.MONGO_HOST]
    );
  }

  private static hasExplicit(sourceEnv: Env, key: EnvVar): boolean {
    return ConfigFactory.isNonEmpty(ConfigFactory.trimToEmpty(sourceEnv[key]));
  }

  private static shouldUseMongoAuth(sourceEnv: Env): boolean {
    return (
      ConfigFactory.hasExplicit(sourceEnv, EnvVar.MONGO_USERNAME) &&
      ConfigFactory.hasExplicit(sourceEnv, EnvVar.MONGO_PASSWORD)
    );
  }

  private static credentialsSegment(username: string, password: string): string {
    return `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
  }

  private static authQuery(authSource: string): string {
    return `?authSource=${encodeURIComponent(authSource)}`;
  }

  private static buildMongoUriWithAuth(params: {
    host: string;
    port: string;
    dbName: string;
    username: string;
    password: string;
    authSource: string;
  }): string {
    const { host, port, dbName, username, password, authSource } = params;
    return `mongodb://${ConfigFactory.credentialsSegment(username, password)}${host}:${port}/${dbName}${ConfigFactory.authQuery(authSource)}`;
  }

  private static buildMongoUriNoAuth(params: { host: string; port: string; dbName: string }): string {
    const { host, port, dbName } = params;
    return `mongodb://${host}:${port}/${dbName}`;
  }

  static from(sourceEnv: Env): AppConfig {
    const resolved = ConfigFactory.resolveKnownEnv(sourceEnv);

    const persistence = ConfigFactory.parsePersistence(resolved[EnvVar.PERSISTENCE]);
    const dbName = resolved[EnvVar.MONGO_DATABASE];

    const providedUri = ConfigFactory.trimToEmpty(sourceEnv[EnvVar.MONGO_URI]);
    const host = ConfigFactory.chooseMongoHost(sourceEnv, resolved);
    const port = resolved[EnvVar.MONGO_PORT];

    const uri = ConfigFactory.isNonEmpty(providedUri)
      ? providedUri
      : ConfigFactory.shouldUseMongoAuth(sourceEnv)
        ? ConfigFactory.buildMongoUriWithAuth({
            host,
            port,
            dbName,
            username: resolved[EnvVar.MONGO_USERNAME],
            password: resolved[EnvVar.MONGO_PASSWORD],
            authSource: resolved[EnvVar.MONGO_AUTH_SOURCE],
          })
        : ConfigFactory.buildMongoUriNoAuth({
            host,
            port,
            dbName,
          });

    const collection = resolved[EnvVar.MONGO_COLLECTION];

    return {
      persistence,
      database: { uri, dbName, collection },
    };
  }

  static fromProcessEnv(): AppConfig {
    return ConfigFactory.from(process.env as Env);
  }
}

export const configFrom = ConfigFactory.from;
export const configFromEnv = ConfigFactory.fromProcessEnv;
