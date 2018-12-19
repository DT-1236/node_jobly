const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');
const getMany = require('../helpers/generateGetManyQuery');

class Company {
  // All methods take an object as its only argument
  constructor({ handle, name, num_employees, description, logo_url }) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
  }

  // First argument is an object which contains the key=value pairs for the search
  static async many(params) {
    try {
      const query = getMany('companies', params);
      const dbResponse = await db.query(query.query, query.values);
      return dbResponse.rows.map(row => new Company(row));
    } catch (err) {
      // maybe check that it's actually a company doesn't exist error
      err.status = 404;
      throw err;
    }
  }

  static async get({ handle }) {
    try {
      const dbResponse = await db.query(
        `SELECT * FROM companies WHERE handle=$1`,
        [handle]
      );
      return new Company(dbResponse.rows[0]);
    } catch (err) {
      // maybe check that it's actually a company doesn't exist error
      err.status = 404;
      throw err;
    }
  }

  static async create({ handle, name }) {
    try {
      const dbResponse = await db.query(
        `INSERT INTO companies (handle, name) VALUES ($1, $2) RETURNING *`,
        [handle, name]
      );
      return new Company(dbResponse.rows[0]);
    } catch (err) {
      //   Check that it's actually a pkey error later
      err.status = 409; //Conflict
      throw err;
    }
  }

  // First argument is an object which contains the key=value pairs for the search
  //   For this, handle or id will serve as the identifiers. id will be be prioritized
  static async update(params) {
    try {
      const { handle, ...items } = params;
      const query = partialUpdate('companies', items, 'handle', handle);
      const dbResponse = await db.query(query.query, query.values);
      return new Company(dbResponse.rows[0]);
    } catch (err) {
      // Check if 409 or 404
      // err.status = INCOMPLETE
      throw err;
    }
  }

  static async delete({ handle }) {
    const dbResponse = await db.query(
      `DELETE FROM companies WHERE handle=$1 RETURNING handle, name`,
      [handle]
    );
    const info = dbResponse.rows[0];
    return { message: `${info.name} (${info.handle}) deleted` };
  }

  async delete() {
    return await Company.delete({ handle: this.handle });
    // const dbResponse = await db.query(
    //   `DELETE FROM companies WHERE handle=$1 RETURNING handle, name`,
    //   [this.handle]
    // );
    // const info = dbResponse.rows[0];
    // return { message: `${info.name} (${info.handle}) deleted` };
  }

  async update(params) {
    params.handle = this.handle;
    return await Company.update(params);
    // const { items } = params;
    // const query = partialUpdate('companies', items, 'handle', this.handle);
    // const dbResponse = await db.query(query.query, query.values);
    // return new Company(dbResponse.rows[0]);
  }
}

module.exports = Company;
