process.env.NODE_ENV = 'test';

const app = require('../../app');
const testApp = require('supertest')(app);
const Job = require('../../models/Job');
const db = require('../../db');

beforeAll(async () => {
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
    const response = await testApp.get('/jobs');
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
      .query({ min_salary: 500, title: 'Test' });
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
      .query({ title: 'Garbage TiTlE' });
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
      company_handle: 'bravo'
    });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('job');
    expect(response.body.job).toHaveProperty('title', 'Test Maker');
    expect(response.body.job).toHaveProperty('equity', 0.12);
  });
});

// describe('GET to /jobs/:handle', async () => {
//   it('should return a JSON for a single job', async () => {
//     const response = await testApp.get('/jobs/alpha');
//     expect(response.status).toEqual(200);
//     expect(response.body).toHaveProperty('job');
//     expect(response.body.job).toHaveProperty('name', 'Alpha Bravo');
//     expect(response.body.job).toHaveProperty('jobs');
//   });

//   it('should return a 404 for a missing handle', async () => {
//     const response = await testApp.get('/jobs/garbage_handle');
//     expect(response.status).toEqual(404);
//   });
// });

// describe('PATCH/PUT to /jobs/:handle', async () => {
//   it('Updates an existing job with new information', async () => {
//     const response = await testApp
//       .patch('/jobs/alpha')
//       .send({ name: 'cake', num_employees: 20 });
//     expect(response.body.job).toEqual({
//       handle: 'alpha',
//       name: 'cake',
//       num_employees: 20,
//       description: null,
//       logo_url: null
//     });
//     await testApp
//       .patch('/jobs/alpha')
//       .send({ name: 'Alpha Bravo', num_employees: 1 });
//   });

//   it('should return a 404 for a missing handle', async () => {
//     const response = await testApp
//       .patch('/jobs/garbage_handle')
//       .send({ name: 'cake', num_employees: 20 });
//     expect(response.status).toEqual(404);
//   });
// });

// describe('DELETE to /jobs/:handle', async () => {
//   it('should delete a job', async () => {
//     let response = await testApp.delete('/jobs/alpha');
//     expect(response.body).toEqual({ message: `Alpha Bravo (alpha) deleted` });
//   });

//   it('should return a 404 for a missing handle', async () => {
//     const response = await testApp.delete('/jobs/garbage_handle');
//     expect(response.status).toEqual(404);
//   });
// });

afterAll(async () => {
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);
  db.end();
});
