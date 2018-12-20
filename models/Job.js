const db = require('../db');
const partialUpdate = require('../helpers/partialUpdate');
const getMany = require('../helpers/generateGetManyQuery');

class Job {
  constructor({ id, title, salary, equity, company_handle, date_posted }) {
    this.id = id;
    this.title = title;
    this.salary = salary;
    this.equity = equity;
    this.company_handle = company_handle;
    this.date_posted = date_posted;
  }

  static async many(params) {
    const { query, values } = getMany('jobs', params);
    const dbResponse = await db.query(query, values);
    return dbResponse.rows.map(row => new Job(row));
  }

  static async get({ id }) {
    const dbResponse = await db.query(`SELECT * FROM jobs WHERE id=$1`, [id]);
    ifEmpty404(dbResponse);
    return new Job(dbResponse.rows[0]);
  }

  static async getByCompany({ handle }) {
    const dbResponse = await db.query(
      `SELECT * FROM jobs JOIN companies ON jobs.company_handle = companies.handle WHERE companies.handle = $1`,
      [handle]
    );
    // ifEmpty404(dbResponse);
    return dbResponse.rows.map(row => new Job(row));
  }

  static async create({ title, salary, equity, handle }) {
    const dbResponse = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, salary, equity, handle]
    );
    return new Job(dbResponse.rows[0]);
  }

  static async update(params) {
    const { id, ...items } = params;
    const query = partialUpdate('jobs', items, 'id', id);
    const dbResponse = await db.query(query.query, query.values);
    ifEmpty404(dbResponse);
    return new Job(dbResponse.rows[0]);
  }

  static async delete({ id }) {
    const dbResponse = await db.query(
      `DELETE FROM jobs WHERE id=$1 RETURNING title`,
      [id]
    );
    ifEmpty404(dbResponse);

    const info = dbResponse.rows[0];
    return `${info.title} deleted`;
  }

  async delete() {
    return await Job.delete({ id: this.id });
    // const dbResponse = await db.query(
    //   `DELETE FROM jobs WHERE id=$1 RETURNING id, title`,
    //   [this.id]
    // );
    // const info = dbResponse.rows[0];
    // return { message: `${info.title} (${info.id}) deleted` };
  }

  async update(params) {
    params.id = this.id;
    return await Job.update(params);
    // const { items } = params;
    // const query = partialUpdate('jobs', items, 'id', this.id);
    // const dbResponse = await db.query(query.query, query.values);
    // return new Job(dbResponse.rows[0]);
  }
}

function ifEmpty404(dbResponse) {
  if (dbResponse.rows.length === 0) {
    const error = new Error();
    error.message = 'No matching job found';
    error.status = 404;
    throw error;
  }
}

module.exports = Job;
