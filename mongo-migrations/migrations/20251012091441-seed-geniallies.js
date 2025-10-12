module.exports = {
  /**
   * @param {import('mongodb').Db} db
   */
  async up(db) {
    /** @type {import('mongodb').Collection<{
     *  _id: string,
     *  name: string,
     *  description?: string,
     *  createdAt: Date,
     *  modifiedAt?: Date,
     *  deletedAt?: Date
     * }>} */
    const col = db.collection('geniallies');

    const dateFromEpocMilliseconds = (ms) => new Date(Number(ms));

    const geniallies = [
      {
        id: 'b3f94e2a-0f9a-4d2a-9e83-3dca7f9b1c21',
        name: 'Interactive quiz',
        description: 'Math basics',
        createdAt: '1759248720000',
        modifiedAt: '1759392000000',
      },
      {
        id: '2d6c3e7b-5f19-4caa-8e2c-9270c8d9fa45',
        name: 'Onboarding tour',
        description: 'First steps',
        createdAt: '1751716800000',
      },
      {
        id: '7a5f09c1-3b4d-4e2f-9a7b-8c2d5e1f0a31',
        name: 'Marketing pitch',
        description: 'Q4 deck',
        createdAt: '1759483800000',
        modifiedAt: '1760008800000',
      },
      {
        id: '4c1a2b3d-8e7f-4a6c-9d5e-1f2a3b4c5d6e',
        name: 'Halloween template',
        description: 'Spooky theme',
        createdAt: '1759276800000',
        deletedAt: '1760253300000',
      },
      {
        id: '0c9e7a1d-2b3f-4a5c-8d9e-0f1a2b3c4d5e',
        name: 'Science lab',
        description: 'Experiments set',
        createdAt: '1755787500000',
      },
      {
        id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        name: 'Safety training',
        description: 'Workplace rules',
        createdAt: '1749542400000',
        modifiedAt: '1756722600000',
      },
      {
        id: 'f0e1d2c3-b4a5-4f6e-8d9c-1a2b3c4d5e6f',
        name: 'Product roadmap',
        description: '2026 preview',
        createdAt: '1759658400000',
        modifiedAt: '1760118000000',
      },
      {
        id: '9e8d7c6b-5a4f-4e3d-8c2b-1f0e9d8c7b6a',
        name: 'Customer survey',
        description: 'NPS 2025',
        createdAt: '1757960700000',
        deletedAt: '1760209200000',
      },
      {
        id: '12ab34cd-56ef-47a8-9b0c-d1e2f3a4b5c6',
        name: 'Team intro',
        description: 'Meet the team',
        createdAt: '1747726500000',
        modifiedAt: '1748768400000',
      },
      {
        id: 'cafe12ab-34cd-4e56-8f90-abcde1234567',
        name: 'Holiday plan',
        description: 'Winter schedule',
        createdAt: '1759903920000',
      },
      {
        id: 'deadbeef-0000-4000-8000-abcdef123456',
        name: 'Coding kata',
        description: 'Refactor practice',
        createdAt: '1754820000000',
        modifiedAt: '1755256271000',
      },
      {
        id: '00112233-4455-4677-8899-aabbccddeeff',
        name: 'Sales training',
        description: 'Objection handling',
        createdAt: '1753189980000',
        deletedAt: '1760127620000',
      },
      {
        id: '5f4d3c2b-1a0e-4b7c-9d8e-7f6a5b4c3d2e',
        name: 'Workshop deck',
        description: 'TDD crash course',
        createdAt: '1756717200000',
        modifiedAt: '1758988800000',
      },
      {
        id: '3e2d1c0b-9a8f-4e7d-8c6b-5a4f3e2d1c0b',
        name: 'FAQ page',
        description: 'Support cheatsheet',
        createdAt: '1751296515000',
      },
      {
        id: '8a7b6c5d-4e3f-4a2b-9c8d-7e6f5d4c3b2a',
        name: 'Release notes',
        description: 'v3.4 highlights',
        createdAt: '1760223600000',
      },
      {
        id: '8a7b6c5d-4e3f-4a2b-9c8d-7e6f5d4c3b2a',
        name: 'A deleted genially',
        description: 'v3.4 highlights',
        createdAt: '1760223600000',
        modifiedAt: '1758988800000',
        deletedAt: '1758988800000',
      },
    ];

    const docs = geniallies.map((genially) => ({
      _id: genially.id,
      name: genially.name,
      ...(genially.description != null ? { description: genially.description } : {}),
      createdAt: dateFromEpocMilliseconds(genially.createdAt),
      ...(genially.modifiedAt ? { modifiedAt: dateFromEpocMilliseconds(genially.modifiedAt) } : {}),
      ...(genially.deletedAt ? { deletedAt: dateFromEpocMilliseconds(genially.deletedAt) } : {}),
    }));

    const ops = docs.map((doc) => ({
      replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
    }));

    await col.bulkWrite(ops, { ordered: true });
  },

  /**
   * @param {import('mongodb').Db} db
   */
  async down(db) {
    const ids = [
      'b3f94e2a-0f9a-4d2a-9e83-3dca7f9b1c21',
      '2d6c3e7b-5f19-4caa-8e2c-9270c8d9fa45',
      '7a5f09c1-3b4d-4e2f-9a7b-8c2d5e1f0a31',
      '4c1a2b3d-8e7f-4a6c-9d5e-1f2a3b4c5d6e',
      '0c9e7a1d-2b3f-4a5c-8d9e-0f1a2b3c4d5e',
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'f0e1d2c3-b4a5-4f6e-8d9c-1a2b3c4d5e6f',
      '9e8d7c6b-5a4f-4e3d-8c2b-1f0e9d8c7b6a',
      '12ab34cd-56ef-47a8-9b0c-d1e2f3a4b5c6',
      'cafe12ab-34cd-4e56-8f90-abcde1234567',
      'deadbeef-0000-4000-8000-abcdef123456',
      '00112233-4455-4677-8899-aabbccddeeff',
      '5f4d3c2b-1a0e-4b7c-9d8e-7f6a5b4c3d2e',
      '3e2d1c0b-9a8f-4e7d-8c6b-5a4f3e2d1c0b',
      '8a7b6c5d-4e3f-4a2b-9c8d-7e6f5d4c3b2a',
    ];

    await db.collection('geniallies').deleteMany({ _id: { $in: ids } });
  },
};
