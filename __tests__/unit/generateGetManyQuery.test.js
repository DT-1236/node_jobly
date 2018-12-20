const generateGetManyQuery = require('../../helpers/generateGetManyQuery');

describe('partialUpdate()', () => {
  it('should generate a proper select query with just 1 field', () => {
    let result = generateGetManyQuery('users', { handle: 'Elie' });
    expect(result.query).toEqual('SELECT * FROM users WHERE handle ILIKE $1');
    expect(result.values).toEqual(['%Elie%']);
  });

  it('should generate a proper partial update query with 2 fields', () => {
    let result = generateGetManyQuery('users', {
      firstName: 'Elie',
      lastName: 'Schoppik'
    });
    expect(result.query).toEqual(
      'SELECT * FROM users WHERE firstName = $1 AND lastName = $2'
    );
    expect(result.values).toEqual(['Elie', 'Schoppik']);
  });

  it('should use a proper operator for min_employees', () => {
    let result = generateGetManyQuery('users', {
      min_employees: 20
    });
    expect(result.query).toEqual(
      'SELECT * FROM users WHERE num_employees >= $1'
    );
    expect(result.values).toEqual([20]);
  });
  it('should use a proper operator for max_employees', () => {
    let result = generateGetManyQuery('users', {
      max_employees: 20
    });
    expect(result.query).toEqual(
      'SELECT * FROM users WHERE num_employees <= $1'
    );
    expect(result.values).toEqual([20]);
  });
});
