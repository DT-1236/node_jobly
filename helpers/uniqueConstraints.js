async function checkUniqueConstraints(model, form) {
  for (let attr in form) {
    if (model.uniqueAttributes.has(attr)) {
      let tempObj = {};
      tempObj[attr] = form[attr];
      let dbQuery = await model.many(tempObj).catch(e => e);
      if (dbQuery.length > 0) {
        let err = new Error(
          `An existing record contains '${form[attr]}' already`
        );
        err.status = 409;
        throw err;
      }
    }
  }
}

module.exports = checkUniqueConstraints;
