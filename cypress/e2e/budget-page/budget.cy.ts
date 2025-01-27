describe('Navigation', () => {
  it('should navigate to the Budget Home page', () => {
    // Visit the root URL
    cy.visit('http://localhost:3000');

    // Click the button to navigate to the Budget Home page
    cy.contains('Budget').click();

    // Verify that the URL is correct
    cy.url().should('include', '/budget');

    // Verify that the Budget Home page content is displayed
    cy.contains('Budget Home page');
  });
});
