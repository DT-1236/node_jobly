process.env.NODE_ENV = 'test';

const Company = require('../../models/Company');
const db = require('../../db');

beforeAll(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(
    `
    INSERT INTO companies (handle, name) 
    VALUES 
      ('alpha','Alpha Bravo'), 
      ('bravo', 'Bravo Charlie'), 
      ('echo', 'Echo Foxtrot')
      `
  );
});

describe('Test the many static method', async () => {
  it('should generate an array of company objects', async () => {
    let result = await Company.many();

    expect(result.length).toEqual(3);
    expect(result.every(i => i instanceof Company)).toBeTruthy();
  });

  it('should filter by some parameters', async () => {
    let result = await Company.many({ name: 'bravo' });
    expect(result.length).toEqual(2);
    expect(result.every(i => i instanceof Company)).toBeTruthy();
  });
});

describe('Test the get static method', async () => {
  it('should generate an array of company objects', async () => {
    let result = await Company.get('alpha');

    expect(result).toBeInstanceOf(Company);
    expect(result.name).toEqual('Alpha Bravo');
  });
});

afterAll(async () => {
  db.end();
});
