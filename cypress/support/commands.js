Cypress.Commands.overwrite('visit', function (originalVisit, filename, options) {
  var visitUrl = Cypress.config().baseUrl ? filename : 'dist/examples'.concat(filename);
  originalVisit(visitUrl, options);
});
