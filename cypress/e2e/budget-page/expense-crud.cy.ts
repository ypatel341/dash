describe('Expense CRUD (real backend + database)', () => {
  it('creates an expense, verifies it was saved, then removes it from the test database', () => {
    const vendor = `Cypress Test Vendor ${Date.now()}`;

    cy.visit('http://localhost:3000/budget/enter-expense');

    cy.get('[id="amount-field"]').type('42');
    cy.get('[id="vendor-field"]').type(vendor);
    cy.get('[id="type-field"]').click();
    cy.get('li[data-value="groceries"]').click();
    cy.get('[id="description-field"]').type('Created by Cypress E2E test');

    cy.intercept('POST', '**/api/budget/expense').as('postExpense');
    cy.get('[id="submit-button"]').click();

    cy.wait('@postExpense').then(({ response }) => {
      expect(response?.statusCode).to.eq(200);

      const expenseId = response?.body.id;
      expect(expenseId).to.be.a('string');

      // Verify it was created: it shows up in the expense table for the current month.
      cy.get('[id="expense-table"]')
        .should('contain', vendor)
        .and('contain', 'groceries');
      cy.get('[id="toast-message"]').should('contain', expenseId);

      // Clean up: delete the expense we created from the test database via the real API,
      // then confirm it no longer appears after a refetch.
      cy.request('DELETE', `http://localhost:5000/api/budget/expense/${expenseId}`).then(
        (deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);
        },
      );

      cy.intercept('GET', '**/api/budget/info/allmonthexpense').as('getExpenses');

      cy.reload();
      cy.wait('@getExpenses');
      cy.get('[id="expense-table"]').should('not.contain', vendor);
  });
});
