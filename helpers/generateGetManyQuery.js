// Consider adding a LIMIT functionality later
function generateGetManyQuery(table, items = {}) {
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
    if (columnName === 'name' || columnName === 'handle') {
      columns.push(`${columnName} ILIKE '%$${idx}%'`);
    } else {
      const operator = determineOperator(columnName);
      //   Keep in mind that this will be casting ints as strings
      columns.push(`${operator.string} ${operator.operator} '$${idx}'`);
    }
    idx += 1;
  }

  // build query
  let cols = columns.join(' AND ');
  let ifT = Object.keys(items).length ? '' : '--';
  // Build prepared query for each attribute as well as the key value
  let query = `SELECT * FROM ${table} ${ifT}WHERE ${cols}`;

  let values = Object.values(items);
  console.log({ query, values });
  return { query, values };
}

// Consider an object that maps more strings than just num_employees
function determineOperator(string) {
  if (string.startsWith('max')) {
    return { operator: '<', string: 'num_employees' };
  } else if (string.startsWith('min')) {
    return { operator: '>', string: 'num_employees' };
  } else {
    return { operator: '=', string };
  }
}

module.exports = generateGetManyQuery;

// db.query(result.query, result.values)
