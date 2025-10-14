import type { Collection, Db } from "mongodb";
import Genially from "@domain/Genially";
import GeniallyRepository from "@domain/GeniallyRepository";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import { GeniallyCount } from "@domain/GeniallyCount";
import { Clock } from "@domain/Clock";

type GeniallyDoc = {
  _id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  modifiedAt?: Date | null;
  deletedAt?: Date | null;
};

export default class MongoGeniallyRepository implements GeniallyRepository {
  private readonly geniallyCollection: Collection<GeniallyDoc>;
  private readonly clock: Clock;

  constructor(db: Db, clock: Clock, collectionName = "geniallies") {
    this.geniallyCollection = db.collection<GeniallyDoc>(collectionName);
    this.clock = clock;
  }

  async save(genially: Genially): Promise<void> {
    const primitives = genially.toPrimitives();
    const doc: GeniallyDoc = {
      _id: primitives.id,
      name: primitives.name,
      description: primitives.description ?? null,
      createdAt: primitives.createdAt,
      modifiedAt: primitives.modifiedAt ?? null,
      deletedAt: primitives.deletedAt ?? null,
    };
    await this.geniallyCollection.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
  }

  async find(id: string): Promise<Genially> {
    const geniallyDocument = await this.geniallyCollection.findOne({ _id: id });
    if (!geniallyDocument) throw new GeniallyNotExist(id);

    return Genially.fromPrimitives(this.clock, {
      id: geniallyDocument._id,
      name: geniallyDocument.name,
      description: geniallyDocument.description ?? undefined,
      createdAt: geniallyDocument.createdAt,
      modifiedAt: geniallyDocument.modifiedAt ?? undefined,
      deletedAt: geniallyDocument.deletedAt ?? undefined,
    });
  }

  async delete(id: string): Promise<void> {
    const genially = await this.find(id);
    genially.delete();
    await this.save(genially);
  }

  async countCreated(): Promise<GeniallyCount> {
    const totalGeniallysCreated = await this.geniallyCollection.countDocuments({});
    return new GeniallyCount(totalGeniallysCreated);
  }
}
