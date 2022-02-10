Cypress.Commands.overwrite('visit', (originalVisit, filename, options) => {
  const visitUrl = Cypress.config().baseUrl ? filename : 'dist/examples'.concat(filename);
  originalVisit(visitUrl, options);
});
