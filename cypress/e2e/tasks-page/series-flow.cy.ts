describe('Series flow (real backend + database)', () => {
  it('creates a recurring series via the form and verifies occurrences appear', () => {
    cy.visit('http://localhost:3000/tasks');

    cy.get('[data-testid="create-task-fab"]').click();
    cy.get('[data-testid="task-form-dialog"]').should('be.visible');

    const title = `Cypress Series ${Date.now()}`;
    cy.get('[data-testid="task-title-input"]').find('input').type(title);

    // Toggle recurring on
    cy.get('[data-testid="task-recurring-toggle"]').click();

    cy.intercept('POST', '**/tasks/series').as('createSeries');
    cy.get('[data-testid="task-form-submit"]').click();

    cy.wait('@createSeries').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);

      const seriesId = response?.body.series?.id;
      const taskCount = response?.body.tasks?.length;
      expect(seriesId).to.be.a('string');
      expect(taskCount).to.be.greaterThan(0);

      cy.get('[data-testid="task-form-dialog"]').should('not.exist');

      // At least one occurrence should appear in the upcoming list
      cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

      // Clean up: archive the series, then delete generated tasks
      cy.request(
        'POST',
        `http://localhost:5000/tasks/series/${seriesId}/archive`,
      );
    });
  });

  it('cancels one occurrence of a recurring series', () => {
    // Create a series via API
    cy.request('GET', 'http://localhost:5000/tasks/categories').then(
      ({ body: categories }) => {
        const categoryId = categories[0]?.id;
        const title = `Cypress Cancel Occ ${Date.now()}`;
        const today = new Date().toISOString().split('T')[0];

        cy.request('POST', 'http://localhost:5000/tasks/series', {
          assignedTo: 'Yogi',
          title,
          categoryId,
          kind: 'event',
          modality: 'none',
          timeMode: 'date_only',
          startsOn: today,
          recurrenceRule: 'FREQ=DAILY',
        }).then(({ body }) => {
          const seriesId = body.series.id;

          cy.visit('http://localhost:3000/tasks');
          cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

          // Cancel the first occurrence (today's task)
          cy.contains('[data-testid="task-row"]', title)
            .first()
            .find('[data-testid="task-action-cancel"]')
            .click();

          cy.get('[data-testid="confirm-dialog-confirm"]').click();

          cy.contains('[data-testid="task-row"]', title)
            .first()
            .should('contain', 'Canceled');

          // Clean up
          cy.request(
            'POST',
            `http://localhost:5000/tasks/series/${seriesId}/archive`,
          );
        });
      },
    );
  });
});
