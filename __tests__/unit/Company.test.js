process.env.NODE_ENV = 'test';

const Company = require('../../models/Company');
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
      ('echo', 'Echo Foxtrot')
      `
  );
});

describe('The constructor works', async () => {
  it('creates an object with a name and handle argument', async () => {
    const testCompany = new Company({ handle: 'testHandle', name: 'testName' });
    expect(testCompany).toHaveProperty('handle', 'testHandle');
    expect(testCompany).toHaveProperty('name', 'testName');
    expect(testCompany).toHaveProperty('update');
    expect(testCompany).toHaveProperty('num_employees');
  });
});

describe('Test the many static method', async () => {
  it('should generate an array of all Company objects if there are no arguments', async () => {
    let result = await Company.many();
    expect(result.length).toEqual(3);
    expect(result.every(i => i instanceof Company)).toBeTruthy();
  });

  it('should filter by some parameters', async () => {
    let result = await Company.many({ name: 'bravo' });
    expect(result.length).toEqual(2);
    expect(result.every(i => i instanceof Company)).toBeTruthy();
  });

  it('should return an empty array if nothing matches', async () => {
    let result = await Company.many({ name: 'cake' });
    expect(result).toEqual([]);
  });
});

describe('Test the get static method', async () => {
  it('should generate a single Company object', async () => {
    let result = await Company.get({ handle: 'alpha' });

    expect(result).toBeInstanceOf(Company);
    expect(result.name).toEqual('Alpha Bravo');
  });

  it('should return a 404 error if the handle does not exist ', async () => {
    const error = await Company.get({ handle: 'garbage_handle' }).catch(e => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('status', 404);
    // await expect(
    //   Company.get({ handle: 'garbage_handle' })
    // ).rejects.toBeInstanceOf(Error);
    // await expect(
    //   Company.get({ handle: 'garbage_handle' })
    // ).rejects.toHaveProperty('status', 404);
  });
});

describe('Test the create static method', async () => {
  it('should generate a new Company object and insert into the DB', async () => {
    const error = await Company.get({ handle: 'tcompany' }).catch(e => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message');
    // await expect(Company.get({ handle: 'tcompany' })).rejects.toBeInstanceOf(
    //   Error
    // );
    // await expect(Company.get({ handle: 'tcompany' })).rejects.toHaveProperty(
    //   'message'
    // );
    const testCompany = await Company.create({
      handle: 'tcompany',
      name: 'Test Company'
    });
    expect(testCompany).toBeInstanceOf(Company);
    expect(testCompany).toHaveProperty('name', 'Test Company');
    expect(testCompany).toHaveProperty('handle', 'tcompany');
    expect(await Company.get({ handle: 'tcompany' })).toBeInstanceOf(Company);
  });
});

describe('Test the update static method', async () => {
  it('should update an existing company with new parameters', async () => {
    const alpha = await Company.get({ handle: 'alpha' });
    expect(alpha).toHaveProperty('name', 'Alpha Bravo');
    expect(alpha).toHaveProperty('num_employees', null);
    const newAlpha = await Company.update({
      handle: 'alpha',
      num_employees: 10,
      description: 'TESTY MCTESTYFACE'
    });
    expect(newAlpha).toHaveProperty('num_employees', 10);
    expect(newAlpha).toHaveProperty('description', 'TESTY MCTESTYFACE');
    await Company.update({
      handle: 'alpha',
      num_employees: null,
      description: null
    });
  });
});

describe('Test the update instance method', async () => {
  it('should update an existing company with new parameters', async () => {
    const alpha = await Company.get({ handle: 'alpha' });
    expect(alpha).toHaveProperty('name', 'Alpha Bravo');
    expect(alpha).toHaveProperty('num_employees', null);
    const newAlpha = await alpha.update({
      num_employees: 10,
      description: 'TESTY MCTESTYFACE'
    });
    expect(newAlpha).toHaveProperty('num_employees', 10);
    expect(newAlpha).toHaveProperty('description', 'TESTY MCTESTYFACE');
    await alpha.update({
      num_employees: null,
      description: null
    });
  });
});

describe('Test the delete instance method', async () => {
  it('should delete an existing company', async () => {
    const alpha = await Company.get({ handle: 'alpha' });
    expect(await alpha.delete()).toEqual(
      `${alpha.name} (${alpha.handle}) deleted`
    );
  });
  await Company.create({ handle: 'alpha', name: 'Alpha Bravo' });
});

describe('Test the delete class method', async () => {
  it('should delete an existing company', async () => {
    const bravo = await Company.get({ handle: 'bravo' });
    expect(await Company.delete({ handle: bravo.handle })).toEqual(
      `${bravo.name} (${bravo.handle}) deleted`
    );
  });
  await Company.create({ handle: 'bravo', name: 'Bravo Charlie' });
});

afterAll(async () => {
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);
  db.end();
});
