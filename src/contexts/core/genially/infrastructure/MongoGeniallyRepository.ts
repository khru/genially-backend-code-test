import type { Collection, Db } from "mongodb";
import Genially from "@domain/Genially";
import GeniallyRepository from "@domain/GeniallyRepository";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import { GeniallyCount } from "@domain/GeniallyCount";
import { Clock } from "@domain/Clock";

export type GeniallyDoc = {
  _id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  modifiedAt?: Date | null;
  deletedAt?: Date | null;
};

export const toDocument = (genially: Genially): GeniallyDoc => {
  const primitives = genially.toPrimitives();
  return {
    _id: primitives.id,
    name: primitives.name,
    description: primitives.description ?? null,
    createdAt: primitives.createdAt,
    modifiedAt: primitives.modifiedAt ?? null,
    deletedAt: primitives.deletedAt ?? null,
  };
};

export const fromDocument = (clock: Clock, doc: GeniallyDoc): Genially => {
  return Genially.fromPrimitives(clock, {
    id: doc._id,
    name: doc.name,
    description: doc.description ?? undefined,
    createdAt: doc.createdAt,
    modifiedAt: doc.modifiedAt ?? undefined,
    deletedAt: doc.deletedAt ?? undefined,
  });
};

export default class MongoGeniallyRepository implements GeniallyRepository {
  private readonly geniallyCollection: Collection<GeniallyDoc>;
  private readonly clock: Clock;

  constructor(db: Db, clock: Clock, collectionName = "geniallies") {
    this.geniallyCollection = db.collection<GeniallyDoc>(collectionName);
    this.clock = clock;
  }

  async save(genially: Genially): Promise<void> {
    const doc = toDocument(genially);
    await this.geniallyCollection.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
  }

  async find(id: string): Promise<Genially> {
    const geniallyDocument = await this.geniallyCollection.findOne({ _id: id });
    if (!geniallyDocument) throw new GeniallyNotExist(id);

    return fromDocument(this.clock, geniallyDocument);
  }

  async countCreated(): Promise<GeniallyCount> {
    const totalGeniallysCreated = await this.geniallyCollection.countDocuments({});
    return new GeniallyCount(totalGeniallysCreated);
  }
}
