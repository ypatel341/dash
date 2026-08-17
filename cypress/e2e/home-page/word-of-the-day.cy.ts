describe('Word of the Day (real backend + database)', () => {
  it('shows a word of the day on the home page and keeps serving the same word on reload', () => {
    cy.intercept('GET', '**/api/daily-word').as('getDailyWord');

    cy.visit('http://localhost:3000/');

    cy.wait('@getDailyWord').then(({ response }) => {
      expect(response?.statusCode).to.eq(200);

      const { word } = response?.body;
      expect(word).to.be.a('string').and.not.be.empty;

      cy.get('[id="word-of-the-day"]').should('contain', word);

      // Reloading should re-serve the same cached word for today rather than
      // fetching a new one, proving the daily cache is actually being read.
      cy.intercept('GET', '**/api/daily-word').as('getDailyWordAgain');
      cy.reload();

      cy.wait('@getDailyWordAgain').then(({ response: secondResponse }) => {
        expect(secondResponse?.statusCode).to.eq(200);
        expect(secondResponse?.body.word).to.eq(word);
      });

      cy.get('[id="word-of-the-day"]').should('contain', word);
    });
  });
});
