describe('EnterExpensePage', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/budget/enter-expense');
  });

  //TODO: This test is still broken
  it('should display a success message when the form is submitted successfully', () => {
    // cy.get('[id="person-field"]').select('Both');
    cy.get('[id="amount-field"]').type('100');
    cy.get('[id="vendor-field"]').type('Vendor Name');
    // cy.get('[data-cy="type-field"]').select('rent');
    cy.get('[data-cy="description-field"]').type('Description');
    // cy.get('[data-cy="date-field"]').click(); 

    cy.intercept('POST', 'http://localhost:5000/budget/expense', {
      statusCode: 200,
      body: { message: 'The Expense was successfully saved' },
    }).as('postExpense');

    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@postExpense');
    cy.get('[data-cy="toast-message"]').should(
      'contain',
      'The Expense was successfully saved',
    );
  });

  it('should display an error message when the form submission fails', () => {
    // cy.get('[data-cy="person-field"]').select('Both');
    cy.get('[data-cy="amount-field"]').type('100');
    cy.get('[data-cy="vendor-field"]').type('Vendor Name');
    cy.get('[data-cy="type-field"]').select('rent');
    cy.get('[data-cy="description-field"]').type('Description');
    // cy.get('[data-cy="date-field"]').type('2023-01-01');

    cy.intercept('POST', 'http://localhost:5000/budget/expense', {
      statusCode: 500,
      body: { message: 'Error posting expense' },
    }).as('postExpense');

    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@postExpense');
    cy.get('[data-cy="toast-message"]').should(
      'contain',
      'Error posting expense',
    );
  });
});
