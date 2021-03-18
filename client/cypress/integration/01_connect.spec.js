///  <reference types="Cypress"/>

context('Connect', () => {
  it('Can connect and disconnect', () => {
    cy.visit(Cypress.env('baseUrl'));

    cy.getByTestId('connect').contains(/connect/i);
    cy.getByTestId('player-name').contains(/welcome/i);
    cy.getByTestId('connect').click();
    cy.getByTestId('disconnect').contains(/disconnect/i);
    cy.getByTestId('disconnect').click();
  });
});

context('Details', () => {
  it('Can enter details and display correct information', () => {
    cy.getByTestId('connect').contains(/connect/i);
    cy.getByTestId('connect').click();
    cy.getByTestId('enter-room').contains(/enter/i);
    cy.getByTestId('name').type('Carl');
    cy.getByTestId('room').type('Room 1');
    cy.getByTestId('enter-room').contains(/enter room 1/i);
    cy.getByTestId('player-name').contains(/welcome carl/i);
  });
});

context('Waiting for 2nd player', () => {
  it('Shows waiting for player two', () => {
    cy.getByTestId(' enter-room').click();
  });
});
