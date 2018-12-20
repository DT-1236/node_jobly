process.env.NODE_ENV = 'test';

const app = require('../../app');
const testApp = require('supertest')(app);

const db = require('../../db');

beforeAll(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(
    `
    INSERT INTO companies (handle, name, num_employees) 
    VALUES 
      ('alpha','Alpha Bravo', 1), 
      ('bravo', 'Bravo Charlie', 5), 
      ('echo', 'Echo Foxtrot', 10)
      `
  );
});

describe('GET to /companies', async () => {
  it('should return a json with a key of companies and value of all the companies if no input', async () => {
    const response = await testApp.get('/companies');
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('companies');
    expect(response.body.companies.length).toEqual(3);
    expect(response.body.companies).toContainEqual({
      handle: 'alpha',
      name: 'Alpha Bravo',
      num_employees: 1,
      description: null,
      logo_url: null
    });
  });

  it('should throw 400 if max_employees < min_employees', async () => {
    const response = await testApp
      .get('/companies')
      .query({ max_employees: 1, min_employees: 2 });
    expect(response.body.error).toHaveProperty('status', 400);
    expect(response.body.error).toHaveProperty(
      'message',
      'max_employees must be greater than min_employees'
    );
  });

  it('should filter appropriately by num_employees', async () => {
    const response = await testApp
      .get('/companies')
      .query({ max_employees: 7, min_employees: 2 });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('companies');
    expect(response.body.companies.length).toEqual(1);
    expect(response.body.companies).toContainEqual({
      handle: 'bravo',
      name: 'Bravo Charlie',
      num_employees: 5,
      description: null,
      logo_url: null
    });
  });

  it('should return companies corresponding to query filters', async () => {
    let response = await testApp.get('/companies').query({ handle: 'bravo' });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('companies');
    expect(response.body.companies.length).toEqual(1);
    expect(response.body.companies).toContainEqual({
      handle: 'bravo',
      name: 'Bravo Charlie',
      num_employees: 5,
      description: null,
      logo_url: null
    });
    response = await testApp.get('/companies').query({ name: 'bravo' });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('companies');
    expect(response.body.companies.length).toEqual(2);
    expect(response.body.companies).toContainEqual({
      handle: 'bravo',
      name: 'Bravo Charlie',
      num_employees: 5,
      description: null,
      logo_url: null
    });
  });

  it('returned companies value should be an empty list if there are no matches', async () => {
    const response = await testApp
      .get('/companies')
      .query({ handle: 'garbage_handle' });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('companies');
    expect(response.body.companies.length).toEqual(0);
  });
});

describe('POST to /companies', async () => {
  it('should return a json with a key of company and value of the newly created company', async () => {
    const response = await testApp
      .post('/companies')
      .send({ handle: 'test', name: 'Test Company' });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('company');
    expect(response.body.company).toHaveProperty('name', 'Test Company');
    expect(response.body.company).toHaveProperty('num_employees', null);
  });
});

describe('GET to /companies/:handle', async () => {
  it('should return a JSON for a single company', async () => {
    const response = await testApp.get('/companies/alpha');
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('company');
    expect(response.body.company).toHaveProperty('name', 'Alpha Bravo');
    expect(response.body.company).toHaveProperty('jobs');
  });

  it('should return a 404 for a missing handle', async () => {
    const response = await testApp.get('/companies/garbage_handle');
    expect(response.status).toEqual(404);
  });
});

describe('PATCH/PUT to /companies/:handle', async () => {
  it('Updates an existing company with new information', async () => {
    const response = await testApp
      .patch('/companies/alpha')
      .send({ name: 'cake', num_employees: 20 });
    expect(response.body.company).toEqual({
      handle: 'alpha',
      name: 'cake',
      num_employees: 20,
      description: null,
      logo_url: null
    });
    await testApp
      .patch('/companies/alpha')
      .send({ name: 'Alpha Bravo', num_employees: 1 });
  });

  it('should return a 404 for a missing handle', async () => {
    const response = await testApp
      .patch('/companies/garbage_handle')
      .send({ name: 'cake', num_employees: 20 });
    expect(response.status).toEqual(404);
  });
});

describe('DELETE to /companies/:handle', async () => {
  it('should delete a company', async () => {
    let response = await testApp.delete('/companies/alpha');
    expect(response.body).toEqual({ message: `Alpha Bravo (alpha) deleted` });
  });

  it('should return a 404 for a missing handle', async () => {
    const response = await testApp.delete('/companies/garbage_handle');
    expect(response.status).toEqual(404);
  });
});

afterAll(async () => {
  await db.query(`DELETE FROM companies`);
  db.end();
});
