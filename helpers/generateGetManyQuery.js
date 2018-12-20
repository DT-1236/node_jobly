// Consider adding a LIMIT functionality later

const ilikeColumns = {
  companies: new Set(['name', 'handle']),
  jobs: new Set(['title'])
};

const queryToTableMappings = {
  companies: { max_employees: 'num_employees', min_employees: 'num_employees' },
  jobs: { min_salary: 'salary', min_equity: 'equity' }
};

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
    if (ilikeColumns[table].has(columnName)) {
      columns.push(`${columnName} ILIKE $${idx}`);
      items[columnName] = `%${items[columnName]}%`;
    } else {
      const { operator, string } = determineOperator(columnName, table);
      columns.push(`${string} ${operator} $${idx}`);
    }
    idx += 1;
  }

  // build query
  let cols = columns.join(' AND ');
  let ifT = Object.keys(items).length ? '' : '--';
  // Build prepared query for each attribute as well as the key value
  let query = `SELECT * FROM ${table} ${ifT}WHERE ${cols}`;

  let values = Object.values(items);
  return { query, values };
}

// Consider an object that maps more strings than just num_employees
function determineOperator(string, table) {
  let operator;
  if (string.startsWith('max')) {
    operator = '<=';
    string = queryToTableMappings[table][string];
  } else if (string.startsWith('min')) {
    operator = '>=';
    string = queryToTableMappings[table][string];
  } else {
    operator = '=';
  }
  return { operator, string };
}

module.exports = generateGetManyQuery;

// db.query(result.query, result.values)
