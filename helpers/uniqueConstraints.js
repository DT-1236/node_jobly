async function checkUniqueConstraints(model, form) {
  for (let attr in form) {
    if (model.uniqueAttributes.has(attr)) {
      let tempObj = {};
      tempObj[attr] = form[attr];
      let dbQuery = await model.many(tempObj);
      if (dbQuery.length > 0) {
        // console.log(`\n\n\n\n\n\n ${attr}, ${form[attr]} \n\n\n\n\n`);
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
