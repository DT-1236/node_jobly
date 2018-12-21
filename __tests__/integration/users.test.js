process.env.NODE_ENV = 'test';

const app = require('../../app');
const testApp = require('supertest')(app);
const bcrypt = require('bcrypt');

const db = require('../../db');

beforeAll(async () => {
  await db.query(`DELETE FROM users`);
  const pwd = await bcrypt.hash('pwd', 1);
  await db.query(
    `INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin ) 
    VALUES ('test1', $1, 'first1', 'last1', 'cake@cake.com', '', 'false'),
    ('test2', $1, 'first2', 'last2', 'cake@cake2.com', '', 'false'),
    ('test3', $1, 'first2', 'last3', 'cake@cake3.com', '', 'false')`,
    [pwd]
  );
});

describe('GET to /users', async () => {
  it('should return a json with a key of users and value of all the users if no input', async () => {
    const response = await testApp.get('/users');
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body.users.length).toEqual(3);
    const job = response.body.users[0];
    expect(job).toHaveProperty('username');
    expect(job).toHaveProperty('email');
  });
});

describe('POST to /users', async () => {
  it('should return a json with a key of user and value of the newly created user', async () => {
    const response = await testApp.post('/users').send({
      username: 'testuser',
      password: 'pwd',
      first_name: 'firsttest',
      last_name: 'lasttest',
      email: 'test@email.com',
      photo_url: 'http://www.cake.com/cake.jpg',
      is_admin: 'true'
    });
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('username', 'testuser');
    expect(response.body.user).toHaveProperty('first_name', 'firsttest');
  });
});

describe('GET to /users/:handle', async () => {
  it('should return a JSON for a single user', async () => {
    const response = await testApp.get('/users/test1');
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('username', 'test1');
    expect(response.body.user).toHaveProperty('first_name');
  });

  it('should return a 404 for a missing handle', async () => {
    const response = await testApp.get('/users/garbage_handle');
    expect(response.status).toEqual(404);
  });
});

describe('PATCH/PUT to /users/:username', async () => {
  it('Updates an existing user with new information', async () => {
    const response = await testApp
      .patch('/users/test1')
      .send({ first_name: 'cake', last_name: 'cake' });
    expect(response.body.user).toHaveProperty('first_name', 'cake');
    expect(response.body.user).toHaveProperty('last_name', 'cake');
    expect(response.body.user).toHaveProperty('username', 'test1');
  });

  it('should return a 404 for a missing username', async () => {
    const response = await testApp
      .patch('/users/garbage_username')
      .send({ username: 'garbage_username' });
    expect(response.status).toEqual(404);
  });
});

describe('DELETE to /users/:username', async () => {
  it('should delete a user', async () => {
    let response = await testApp.delete('/users/test1');
    expect(response.body).toEqual({ message: `test1 deleted` });
  });

  it('should return a 404 for a missing username', async () => {
    const response = await testApp.delete('/users/garbage_username');
    expect(response.status).toEqual(404);
  });
});

afterAll(async () => {
  await db.query(`DELETE FROM users`);
  db.end();
});
