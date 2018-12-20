const knownAppConstraints = new Set(['companies_pkey', 'companies_name_key']);
function checkPGDuplicateValue(error) {
  // This is a Postgres error property. Indicates a unique constraint was violated
  if (error.routine !== '_bt_check_unique') {
    return;
  }
  // 501 is Not Implemented. Indicates an unseen error
  error.status = knownAppConstraints.has(error.constraint) ? 409 : 501;
  if (error.status === 501) {
    console.error(`New table contraint found\n\n>>>`, error);
  }
  error.message = `A previous record already has one of those values`;
}

function finalizeEmptyFormError(error) {
  if (error.message === `Empty Update Request`) {
    error.status = 400;
  }
}

module.exports = { checkPGDuplicateValue, finalizeEmptyFormError };
