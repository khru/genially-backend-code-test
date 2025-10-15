module.exports = {
  /**
   * @param {import('mongodb').Db} db
   */
  async up(db) {
    const validator = {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "name", "createdAt"],
        additionalProperties: false,
        properties: {
          _id: { bsonType: "string", description: "Domain id stored as Mongo _id (string UUID)" },
          name: { bsonType: "string", description: "Genially name" },
          description: { bsonType: ["string", "null"], description: "Genially description" },
          createdAt: { bsonType: "date", description: "Creation timestamp" },
          modifiedAt: { bsonType: ["date", "null"], description: "Last modification timestamp" },
          deletedAt: { bsonType: ["date", "null"], description: "Soft delete timestamp" },
        },
      },
    };

    const exists = await db.listCollections({ name: "geniallies" }).hasNext();
    if (!exists) {
      await db.createCollection("geniallies", {
        validator,
        validationAction: "error",
        validationLevel: "strict",
      });
      return;
    }

    await db.command({
      collMod: "geniallies",
      validator,
      validationAction: "error",
      validationLevel: "strict",
    });
  },

  /**
   * @param {import('mongodb').Db} db
   */
  async down(db) {
    await db
      .collection("geniallies")
      .drop()
      .catch(() => {});
  },
};
