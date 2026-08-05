describe('Task page routing and recovery', () => {
  it('renders the React task page on direct navigation to /tasks', () => {
    cy.visit('http://localhost:3000/tasks');
    cy.get('[data-testid="tasks-home-page"]').should('exist');
    cy.get('[data-testid="upcoming-task-list"]').should('exist');
    cy.get('[data-testid="calendar-view"]').should('exist');
  });

  it('renders the React task page after browser refresh on /tasks', () => {
    cy.visit('http://localhost:3000/tasks');
    cy.get('[data-testid="tasks-home-page"]').should('exist');

    cy.reload();

    cy.get('[data-testid="tasks-home-page"]').should('exist');
    cy.get('[data-testid="upcoming-task-list"]').should('exist');
  });

  it('returns API validation error on GET /api/tasks without query params', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:5000/api/tasks',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.error).to.contain('from and to');
    });
  });

  it('returns API data on GET /api/tasks with valid query params', () => {
    const today = new Date().toISOString().split('T')[0];
    cy.request(
      'GET',
      `http://localhost:5000/api/tasks?from=${today}&to=${today}`,
    ).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('recovers cleanly after deleting a task and refreshing', () => {
    const title = `Cypress Refresh ${Date.now()}`;

    cy.request('GET', 'http://localhost:5000/api/tasks/categories')
      .then(({ body: categories }) => {
        expect(categories).to.be.an('array').and.to.have.length.greaterThan(0);
        const categoryId = categories[0].id;

        return cy.request('POST', 'http://localhost:5000/api/tasks', {
          assignedTo: 'Yogi',
          title,
          categoryId,
          kind: 'event',
          modality: 'none',
          taskDate: new Date().toISOString().split('T')[0],
          timeMode: 'date_only',
        });
      })
      .then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

        cy.contains('[data-testid="task-row"]', title)
          .find('[data-testid="task-action-delete"]')
          .click();
        cy.get('[data-testid="confirm-dialog-confirm"]').click();

        cy.get('[data-testid="upcoming-task-list"]').should(
          'not.contain',
          title,
        );

        cy.reload();

        cy.get('[data-testid="tasks-home-page"]').should('exist');
        cy.get('[data-testid="upcoming-task-list"]').should('exist');
        cy.get('[data-testid="task-load-error"]').should('not.exist');
        cy.get('[data-testid="upcoming-task-list"]').should(
          'not.contain',
          title,
        );
      });
  });
});
