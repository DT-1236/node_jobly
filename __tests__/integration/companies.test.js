process.env.NODE_ENV = 'test';

const app = require('../../app');
const testApp = require('supertest')(app);

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

describe('GET to /companies', async () => {
  it('should return a json with a key of companies and value of all the companies', async () => {
    const response = await testApp.get('/companies');
    expect(response.body).toHaveProperty('companies');
    expect(response.body.companies.length).toEqual(3);
    expect(response.body.companies).toContainEqual({
      handle: 'alpha',
      name: 'Alpha Bravo',
      num_employees: null,
      description: null,
      logo_url: null
    });
  });
});

afterAll(async () => {
  await db.query(`DELETE FROM companies`);
  db.end();
});
