const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');
const bcrypt = require('bcrypt');
const getMany = require('../helpers/generateGetManyQuery');

const { WORK_FACTOR } = require('../config');

// const uniqueConstraints = require('../helpers/uniqueConstraints');

class User {
  // All methods take an object as their only argument

  constructor({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url,
    is_admin
  }) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.photo_url = photo_url;
    this.is_admin = is_admin;
  }

  static async many(params) {
    if (params) delete params.token;
    const { query, values } = getMany('users', params);
    const dbResponse = await db.query(query, values);
    return dbResponse.rows.map(row => new User(row));
  }

  // static async many() {
  //   const dbResponse = await db.query(
  //     `SELECT username, first_name, last_name, email FROM users`
  //   );
  //   return dbResponse.rows.map(row => new User(row));
  // }

  static async get({ username }) {
    const dbResponse = await db.query(`SELECT * FROM users WHERE username=$1`, [
      username
    ]);
    ifEmpty404(dbResponse);
    const response = dbResponse.rows[0];
    return new User(response);
  }

  static async create(params) {
    // Note: any fool can send a post request to add/update a user as admin
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      is_admin,
      photo_url
    } = params;
    // await uniqueConstraints(this, params);
    const dbResponse = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        username,
        await bcrypt.hash(password, WORK_FACTOR),
        first_name,
        last_name,
        email,
        photo_url,
        !!is_admin
      ]
    );
    return new User(dbResponse.rows[0]);
  }

  static async login({ username, password }) {
    // Note: any fool can send a post request to add/update a user as admin
    const user = await User.get({ username });
    return (await bcrypt.compare(password, user.password)) ? user : false;
  }

  static async update(params) {
    if (params) delete params.token;
    // Note: any fool can send a post request to add/update a user as admin
    const { query, values } = partialUpdate(
      'users',
      params,
      'username',
      params.username
    );
    const dbResponse = await db.query(query, values);
    ifEmpty404(dbResponse);
    return new User(dbResponse.rows[0]);
  }

  static async delete({ username }) {
    const dbResponse = await db.query(
      `DELETE FROM users WHERE username=$1 RETURNING username`,
      [username]
    );
    ifEmpty404(dbResponse);

    const info = dbResponse.rows[0];
    return `${info.username} deleted`;
  }

  async delete() {
    return await User.delete({ username: this.username });
  }

  async update(params) {
    params.username = this.username;
    return await User.update(params);
  }
}

function ifEmpty404(dbResponse) {
  if (dbResponse.rows.length === 0) {
    const error = new Error();
    error.message = 'No matching User found';
    error.status = 404;
    throw error;
  }
}
User.uniqueAttributes = new Set(['username', 'email']);

module.exports = User;
