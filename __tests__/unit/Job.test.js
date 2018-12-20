process.env.NODE_ENV = 'test';

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

describe('The constructor works', async () => {
  it('creates an object with a title and id argument', async () => {
    const testJob = new Job({
      title: 'testtitle',
      salary: 20000,
      equity: 0,
      company_handle: 'alpha'
    });
    expect(testJob).toHaveProperty('title', 'testtitle');
    expect(testJob).toHaveProperty('salary', 20000);
    expect(testJob).toHaveProperty('equity', 0);
  });
});

describe('Test the many static method', async () => {
  it('should generate an array of all Job objects if there are no arguments', async () => {
    let result = await Job.many();
    expect(result.length).toEqual(3);
    expect(result.every(i => i instanceof Job)).toBeTruthy();
  });

  it('should filter by some parameters', async () => {
    let result = await Job.many({ title: 'Tester', min_salary: 100 });
    expect(result.length).toEqual(1);
    expect(result.every(i => i instanceof Job)).toBeTruthy();
  });

  it('should return an empty array if nothing matches', async () => {
    let result = await Job.many({ title: 'treacle' });
    expect(result).toEqual([]);
  });
});

describe('Test the get static method', async () => {
  it('should generate a single Job object', async () => {
    let result = await Job.get({ id: globeJobRow.id });
    expect(result).toBeInstanceOf(Job);
    expect(result.title).toEqual(globeJobRow.title);
  });

  it('should return a 404 error if the id does not exist ', async () => {
    const error = await Job.get({ id: '-1' }).catch(e => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('status', 404);
  });
});

describe('Test the create static method', async () => {
  it('should generate a new Job object and insert into the DB', async () => {
    const testJob = await Job.create({
      title: 'Test Job',
      salary: 50000,
      equity: 0.25,
      company_handle: 'echo'
    });
    expect(testJob).toBeInstanceOf(Job);
    expect(testJob).toHaveProperty('title', 'Test Job');
    expect(testJob).toHaveProperty('salary', 50000);
    expect(await Job.get({ id: testJob.id })).toBeInstanceOf(Job);
  });
});

describe('Test the update static method', async () => {
  it('should update an existing Job with new parameters', async () => {
    const globeJob = await Job.get({ id: globeJobRow.id });
    expect(globeJob).toHaveProperty('title', globeJobRow.title);
    expect(globeJob).toHaveProperty('salary');
    const newGlobeJob = await Job.update({
      id: globeJobRow.id,
      salary: 10,
      equity: 0.8
    });
    expect(newGlobeJob).toHaveProperty('salary', 10);
    expect(newGlobeJob).toHaveProperty('equity', 0.8);
    await Job.update({
      id: globeJobRow.id,
      salary: globeJobRow.salary,
      equity: globeJobRow.equity
    });
  });
});

describe('Test the update instance method', async () => {
  it('should update an existing Job with new parameters', async () => {
    const globeJob = await Job.get({ id: globeJobRow.id });
    expect(globeJob).toBeInstanceOf(Job);
    const newGlobeJob = await globeJob.update({
      id: globeJobRow.id,
      salary: 10,
      equity: 0.8
    });
    expect(newGlobeJob).toHaveProperty('salary', 10);
    expect(newGlobeJob).toHaveProperty('equity', 0.8);
    await globeJob.update({
      id: globeJobRow.id,
      salary: globeJobRow.salary,
      equity: globeJobRow.equity
    });
  });
});

describe('Test the delete instance method', async () => {
  it('should delete an existing Job', async () => {
    const globeJob = await Job.get({ id: globeJobRow.id });
    expect(await globeJob.delete()).toEqual(`${globeJob.title} deleted`);
  });
});

describe('Test the delete class method', async () => {
  it('should delete an existing Job', async () => {
    expect(await Job.delete({ id: globeJobRow.id })).toEqual(
      `${globeJobRow.title} deleted`
    );
  });
});

afterAll(async () => {
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);

  db.end();
});
