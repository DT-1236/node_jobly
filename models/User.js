const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');
const getMany = require('../helpers/generateGetManyQuery');
const Job = require('./Job');
const bcrypt = require('bcrypt');

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
    // const { query, values } = getMany('users', params);
    const dbResponse = await db.query(
      `SELECT username, first_name, last_name, email FROM users`
    );
    return dbResponse.rows.map(row => new User(row));
  }

  static async get({ username }) {
    const dbResponse = await db.query(`SELECT * FROM users WHERE username=$1`, [
      username
    ]);
    ifEmpty404(dbResponse);
    const response = dbResponse.rows[0];
    return new User(response);
  }

  static async create({
    username,
    password,
    first_name,
    last_name,
    email,
    is_admin,
    photo_url
  }) {
    const dbResponse = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        username,
        await bcrypt.hash(password, 12),
        first_name,
        last_name,
        email,
        photo_url,
        !!is_admin
      ]
    );
    return new User(dbResponse.rows[0]);
  }

  static async update(params) {
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
User.uniqueAttributes = new Set(['username', 'name']);

module.exports = User;
