Cypress.Commands.overwrite('visit', (originalVisit, filename, options) => {
  const visitUrl = Cypress.config().baseUrl ? filename : 'docs'.concat(filename);
  originalVisit(visitUrl, options);
});
