describe('EnterExpensePage', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/budget/enter-expense');
  });

  // TODO: Try to update dropdowns
  it('should display a success message when the form is submitted successfully', () => {
    // cy.get('[id="person-field"]').select('Both');
    cy.get('[id="amount-field"]').type('100');
    cy.get('[id="vendor-field"]').type('Vendor Name');
    // cy.get('[data-cy="type-field"]').select('rent');
    cy.get('[id="description-field"]').type('Description');
    // cy.get('[data-cy="date-field"]').click();

    cy.intercept('POST', 'http://localhost:5000/budget/expense', {
      statusCode: 200,
    }).as('postExpense');

    cy.get('[id="submit-button"]').click();
    cy.wait('@postExpense');
    cy.get('[id="toast-message"]').should(
      'contain',
      'The Expense was successfully saved',
    );
  });

  it('should display an error message when the form submission fails -> amount is greater than 10000', () => {
    // cy.get('[id="person-field"]').select('Both');
    cy.get('[id="amount-field"]').type('1000000');
    cy.get('[id="vendor-field"]').type('Vendor Name');
    // cy.get('[data-cy="type-field"]').select('rent');
    cy.get('[id="description-field"]').type('Description');
    // cy.get('[data-cy="date-field"]').click();

    cy.intercept('POST', 'http://localhost:5000/budget/expense', {
      statusCode: 500,
    }).as('postExpense');

    cy.get('[id="submit-button"]').click();
    cy.wait('@postExpense');
    cy.get('[id="toast-message"]').should(
      'contain',
      'There was an error saving the Expense',
    );
  });
});
