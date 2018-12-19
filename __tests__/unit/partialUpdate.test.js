const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', () => {
  it('should generate a proper partial update query with just 1 field', () => {
    let result = sqlForPartialUpdate('users', { firstName: 'Elie' }, 'id', 100);
    expect(result.query).toEqual(
      'UPDATE users SET firstName=$1 WHERE id=$2 RETURNING *'
    );
    expect(result.values).toEqual(['Elie', 100]);
  });

  it('should generate a proper partial update query with 2 fields', () => {
    let result = sqlForPartialUpdate(
      'users',
      { firstName: 'Elie', lastName: 'Schoppik' },
      'id',
      100
    );
    expect(result.query).toEqual(
      'UPDATE users SET firstName=$1, lastName=$2 WHERE id=$3 RETURNING *'
    );
    expect(result.values).toEqual(['Elie', 'Schoppik', 100]);
  });
});
