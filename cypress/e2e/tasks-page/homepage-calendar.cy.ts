describe('Homepage tasks card', () => {
  it("shows today's tasks card on the landing page", () => {
    cy.visit('http://localhost:3000/');
    cy.get('[data-testid="today-tasks-card"]').should('exist');
  });

  it('navigates to /tasks when "View all tasks" is clicked', () => {
    cy.visit('http://localhost:3000/');
    cy.get('[data-testid="today-tasks-view-all"]').click();
    cy.url().should('include', '/tasks');
    cy.get('[data-testid="tasks-home-page"]').should('exist');
  });

  it("shows today's planned tasks on the homepage card", () => {
    const title = `Cypress Home ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    cy.request('GET', 'http://localhost:5000/api/tasks/categories')
      .then(({ body: categories }) => {
        const categoryId = categories[0]?.id;
        expect(categoryId).to.be.a('string');

        return cy.request('POST', 'http://localhost:5000/api/tasks', {
          assignedTo: 'Yogi',
          title,
          categoryId,
          kind: 'event',
          modality: 'none',
          taskDate: today,
          timeMode: 'date_only',
        });
      })
      .then(({ body }) => {
      const taskId = body.id;

      cy.visit('http://localhost:3000/');
      cy.get('[data-testid="today-tasks-card"]').should('contain', title);

      cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`);
    });
  });
});

describe('Calendar view', () => {
  it('shows calendar and day detail panel', () => {
    cy.visit('http://localhost:3000/tasks');
    cy.get('[data-testid="calendar-view"]').should('exist');
    cy.get('[data-testid="calendar-day-detail"]').should('exist');
  });

  it('shows task indicators on calendar days with tasks', () => {
    const title = `Cypress Cal ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    cy.request('POST', 'http://localhost:5000/api/tasks', {
      assignedTo: 'Yogi',
      title,
      categoryId: null,
      kind: 'event',
      modality: 'none',
      taskDate: today,
      timeMode: 'date_only',
    }).then(({ body }) => {
      const taskId = body.id;

      cy.visit('http://localhost:3000/tasks');

      // The day detail should show the task when today is selected
      cy.get('[data-testid="calendar-day-detail"]').should('contain', title);

      cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`);
    });
  });

  it('shows "No tasks on this day" for empty days', () => {
    cy.visit('http://localhost:3000/tasks');

    // Click on a day that likely has no tasks (day 1 of next month)
    cy.get('[data-testid="calendar-view"]')
      .find(
        'button[aria-label*="next month"], button.MuiPickersArrowSwitcher-button',
      )
      .last()
      .click();

    // Wait for month to load
    cy.wait(500);

    // Click on day 1
    cy.get('[data-testid="calendar-view"]')
      .find('button.MuiPickersDay-root')
      .contains('1')
      .click();

    cy.get('[data-testid="calendar-day-detail"]').should(
      'contain',
      'No tasks on this day',
    );
  });
});
