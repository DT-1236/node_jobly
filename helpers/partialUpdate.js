/**
 * Generate a selective update query based on a request body:
 *
 * - table: where to make the query
 * - items: an object containing column names and updated values
 * - key: the column that we query by (e.g. username, handle, id)
 * - id: current record ID
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */

function sqlForPartialUpdate(table, items, key, id) {
  // keep track of item indexes
  // store all the columns we want to update and associate with vals

  let idx = 1;
  let columns = [];

  // filter out keys that start with "_" -- we don't want these in DB
  for (let columnName in items) {
    if (columnName.startsWith('_')) {
      delete items[columnName];
    }
  }

  for (let columnName in items) {
    columns.push(`${columnName}=$${idx}`);
    idx += 1;
  }

  // build query
  let cols = columns.join(', ');
  // Build prepared query for each attribute as well as the key value
  let query = `UPDATE ${table} SET ${cols} WHERE ${key}=$${idx} RETURNING *`;

  let values = Object.values(items);
  values.push(id);

  return { query, values };
}

module.exports = sqlForPartialUpdate;

// db.query(result.query, result.values)
