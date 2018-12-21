const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');
const getMany = require('../helpers/generateGetManyQuery');
const Job = require('./Job');
// const uniqueConstraints = require('../helpers/uniqueConstraints');

class Company {
  // All methods take an object as their only argument

  constructor({ handle, name, num_employees, description, logo_url, jobs }) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
    this.jobs = jobs;
  }

  static async many(params) {
    const { query, values } = getMany('companies', params);
    const dbResponse = await db.query(query, values);
    return dbResponse.rows.map(row => new Company(row));
  }

  static async get({ handle }) {
    const dbResponse = await db.query(
      `SELECT * FROM companies WHERE handle=$1`,
      [handle]
    );
    ifEmpty404(dbResponse);
    const response = dbResponse.rows[0];
    const jobs = await Job.getByCompany({ handle });
    response.jobs = jobs;
    return new Company(response);
  }

  static async create({ handle, name }) {
    // await uniqueConstraints(this, { handle, name });
    const dbResponse = await db.query(
      `INSERT INTO companies (handle, name) VALUES ($1, $2) RETURNING *`,
      [handle, name]
    );
    return new Company(dbResponse.rows[0]);
  }

  static async update(params) {
    const { handle, ...items } = params;
    // await uniqueConstraints(this, { name: items.name });
    const { query, values } = partialUpdate(
      'companies',
      items,
      'handle',
      handle
    );
    const dbResponse = await db.query(query, values);
    ifEmpty404(dbResponse);
    return new Company(dbResponse.rows[0]);
  }

  static async delete({ handle }) {
    const dbResponse = await db.query(
      `DELETE FROM companies WHERE handle=$1 RETURNING handle, name`,
      [handle]
    );
    ifEmpty404(dbResponse);

    const info = dbResponse.rows[0];
    return `${info.name} (${info.handle}) deleted`;
  }

  async delete() {
    return await Company.delete({ handle: this.handle });
  }

  async update(params) {
    params.handle = this.handle;
    return await Company.update(params);
  }
}

function ifEmpty404(dbResponse) {
  if (dbResponse.rows.length === 0) {
    const error = new Error();
    error.message = 'No matching company found';
    error.status = 404;
    throw error;
  }
}
Company.uniqueAttributes = new Set(['handle', 'name']);

module.exports = Company;
