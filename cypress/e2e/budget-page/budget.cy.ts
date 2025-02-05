describe('Navigation', () => {
  it('should navigate to the budget details page when a budget is clicked', () => {
    // focus on the budget: date_night
    cy.visit('http://localhost:3000/budget');
    cy.contains('Budget').click();
    cy.url().should('include', '/budget');

    cy.contains('[id="budget-card"]', 'Date Night').click();
    cy.url().should('include', '/budget/details/date_night');
  });
});
