process.env.NODE_ENV = 'test';

const app = require('../../app');
const testApp = require('supertest')(app);
const db = require('../../db');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../../config');
let token, adminToken;

beforeAll(async () => {
  token = await jwt.sign({ username: 'test1', is_admin: false }, SECRET);
  adminToken = await jwt.sign({ username: 'test1', is_admin: true }, SECRET);
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);
  await db.query(
    `
    INSERT INTO companies (handle, name) 
    VALUES 
      ('alpha','Alpha Bravo'), 
      ('bravo', 'Bravo Charlie'), 
      ('echo', 'Echo Foxtrot')`
  );

  await db.query(
    `INSERT INTO jobs (title, salary, equity, company_handle) 
    VALUES 
      ('Cake Tester', 1000, 0.2, 'alpha' ), 
      ('Pie Tester', 50.12, 0.3, 'bravo' ), 
      ('Tart Maker', 5000, 0, 'echo' )
      `
  );
});

let globeJobRow;

beforeEach(async () => {
  const dbResponse = await db.query(`SELECT * FROM jobs LIMIT 1`);
  globeJobRow = dbResponse.rows[0];
});

describe('GET to /jobs', async () => {
  it('should return a json with a key of jobs and value of all the jobs if no input', async () => {
    const response = await testApp.get('/jobs').send({ token });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('jobs');
    expect(response.body.jobs).toHaveLength(3);
    const job = response.body.jobs[0];
    expect(job).toHaveProperty('title');
    expect(job).toHaveProperty('salary');
    expect(job).toHaveProperty('equity');
  });

  it('should filter appropriately by multiple parameters', async () => {
    const response = await testApp
      .get('/jobs')
      .query({ min_salary: 500, title: 'Test', token });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('jobs');
    expect(response.body.jobs).toHaveLength(1);
    const job = response.body.jobs[0];
    expect(job).toHaveProperty('title', 'Cake Tester');
    expect(job).toHaveProperty('salary', 1000);
  });

  it('returned jobs value should be an empty list if there are no matches', async () => {
    const response = await testApp
      .get('/jobs')
      .query({ title: 'Garbage TiTlE', token });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('jobs');
    expect(response.body.jobs).toHaveLength(0);
  });
});

describe('POST to /jobs', async () => {
  it('should return a json with a key of job and value of the newly created job', async () => {
    const response = await testApp.post('/jobs').send({
      title: 'Test Maker',
      salary: 50000,
      equity: 0.12,
      company_handle: 'bravo',
      token: adminToken
    });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('job');
    expect(response.body.job).toHaveProperty('title', 'Test Maker');
    expect(response.body.job).toHaveProperty('equity', 0.12);
  });
});

describe('GET to /jobs/:handle', async () => {
  it('should return a JSON for a single job', async () => {
    const response = await testApp
      .get(`/jobs/${globeJobRow.id}`)
      .send({ token });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('job');
    expect(response.body.job).toHaveProperty('title', globeJobRow.title);
  });

  it('should return a 404 for a missing handle', async () => {
    const response = await testApp.get('/jobs/-1').send({ token });
    expect(response.status).toEqual(404);
  });
});

describe('PATCH/PUT to /jobs/:handle', async () => {
  it('Updates an existing job with new information', async () => {
    const response = await testApp
      .patch(`/jobs/${globeJobRow.id}`)
      .send({ title: 'cake', salary: 20, token: adminToken });
    expect(response.body).toHaveProperty('job');
    expect(response.body.job.salary).toBe(20);
    expect(response.body.job.title).toBe('cake');
  });

  it('should return a 404 for a missing handle', async () => {
    const response = await testApp
      .patch('/jobs/-1')
      .send({ title: 'cake', salary: 20, token: adminToken });
    expect(response.status).toEqual(404);
  });
});

describe('DELETE to /jobs/:handle', async () => {
  it('should delete a job', async () => {
    let response = await testApp
      .delete(`/jobs/${globeJobRow.id}`)
      .send({ token: adminToken });
    expect(response.body).toEqual({ message: `${globeJobRow.title} deleted` });
  });

  it('should return a 404 for a missing handle', async () => {
    const response = await testApp
      .delete('/jobs/-1')
      .send({ token: adminToken });
    expect(response.status).toEqual(404);
  });
});

afterAll(async () => {
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);
  db.end();
});
