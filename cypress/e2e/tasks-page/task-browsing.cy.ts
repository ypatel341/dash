describe('Month-Based Task Browsing', () => {
  const API = 'http://localhost:5000';
  let categoryId: string;
  const createdTaskIds: string[] = [];

  const today = new Date();
  const thisMonthDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    Math.min(today.getDate() + 1, 28),
  );
  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 15);
  const twoMonthsDate = new Date(today.getFullYear(), today.getMonth() + 2, 15);

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  before(() => {
    cy.request('GET', `${API}/api/tasks/categories`).then(({ body }) => {
      categoryId = body[0]?.id;
      expect(categoryId).to.be.a('string');
    });
  });

  const createTask = (
    overrides: Record<string, unknown> = {},
  ): Cypress.Chainable => {
    return cy
      .request('POST', `${API}/api/tasks`, {
        assignedTo: 'Yogi',
        title: `Browse Test ${Date.now()}`,
        categoryId,
        kind: 'event',
        modality: 'none',
        taskDate: fmt(thisMonthDate),
        timeMode: 'date_only',
        ...overrides,
      })
      .then(({ body }) => {
        createdTaskIds.push(body.id);
        return body;
      });
  };

  afterEach(() => {
    createdTaskIds.forEach((id) => {
      cy.request({
        method: 'DELETE',
        url: `${API}/api/tasks/${id}`,
        failOnStatusCode: false,
      });
    });
    createdTaskIds.length = 0;
  });

  describe('Default view (this month)', () => {
    it('shows tasks for this month and the "Next month" button', () => {
      const title = `This Month ${Date.now()}`;
      createTask({ title, taskDate: fmt(thisMonthDate) }).then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.get('[data-testid="upcoming-task-list"]').should('contain', title);
        cy.get('[data-testid="month-nav-next"]').should('be.visible');
        cy.get('[data-testid="month-nav-back"]').should('not.exist');
        cy.get('[data-testid="month-nav-current"]').should('not.exist');
      });
    });

    it('does not show tasks from next month', () => {
      const thisTitle = `This Month Only ${Date.now()}`;
      const nextTitle = `Next Month Only ${Date.now()}`;
      createTask({ title: thisTitle, taskDate: fmt(thisMonthDate) }).then(
        () => {
          createTask({ title: nextTitle, taskDate: fmt(nextMonthDate) }).then(
            () => {
              cy.visit('http://localhost:3000/tasks');
              cy.get('[data-testid="upcoming-task-list"]').should(
                'contain',
                thisTitle,
              );
              cy.get('[data-testid="upcoming-task-list"]').should(
                'not.contain',
                nextTitle,
              );
            },
          );
        },
      );
    });
  });

  describe('Paging to next month', () => {
    it('shows next month tasks and three-button nav after clicking forward', () => {
      const nextTitle = `Next Month Nav ${Date.now()}`;
      createTask({ title: nextTitle, taskDate: fmt(nextMonthDate) }).then(
        () => {
          cy.visit('http://localhost:3000/tasks');
          cy.get('[data-testid="month-nav-next"]').click();
          cy.get('[data-testid="upcoming-task-list"]').should(
            'contain',
            nextTitle,
          );
          cy.get('[data-testid="month-nav-back"]').should('be.visible');
          cy.get('[data-testid="month-nav-current"]').should('be.visible');
          cy.get('[data-testid="month-nav-next"]').should('be.visible');
        },
      );
    });

    it('hides this month tasks when viewing next month', () => {
      const thisTitle = `This Only ${Date.now()}`;
      const nextTitle = `Next Only ${Date.now()}`;
      createTask({ title: thisTitle, taskDate: fmt(thisMonthDate) }).then(
        () => {
          createTask({ title: nextTitle, taskDate: fmt(nextMonthDate) }).then(
            () => {
              cy.visit('http://localhost:3000/tasks');
              cy.get('[data-testid="month-nav-next"]').click();
              cy.get('[data-testid="upcoming-task-list"]').should(
                'contain',
                nextTitle,
              );
              cy.get('[data-testid="upcoming-task-list"]').should(
                'not.contain',
                thisTitle,
              );
            },
          );
        },
      );
    });
  });

  describe('Multi-month paging', () => {
    it('pages forward two months then back one', () => {
      const twoTitle = `Two Months ${Date.now()}`;
      createTask({ title: twoTitle, taskDate: fmt(twoMonthsDate) }).then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.get('[data-testid="month-nav-next"]').click();
        cy.get('[data-testid="upcoming-task-list"]').should(
          'not.contain',
          twoTitle,
        );
        cy.get('[data-testid="month-nav-next"]').click();
        cy.get('[data-testid="upcoming-task-list"]').should(
          'contain',
          twoTitle,
        );
        cy.get('[data-testid="month-nav-back"]').click();
        cy.get('[data-testid="upcoming-task-list"]').should(
          'not.contain',
          twoTitle,
        );
      });
    });
  });

  describe('Current button', () => {
    it('snaps back to current month from any offset', () => {
      const thisTitle = `Snap Home ${Date.now()}`;
      createTask({ title: thisTitle, taskDate: fmt(thisMonthDate) }).then(
        () => {
          cy.visit('http://localhost:3000/tasks');
          cy.get('[data-testid="month-nav-next"]').click();
          cy.get('[data-testid="month-nav-next"]').click();
          cy.get('[data-testid="month-nav-current"]').click();
          cy.get('[data-testid="upcoming-task-list"]').should(
            'contain',
            thisTitle,
          );
          cy.get('[data-testid="month-nav-current"]').should('not.exist');
          cy.get('[data-testid="month-nav-back"]').should('not.exist');
        },
      );
    });
  });

  describe('Filters across page changes', () => {
    it('preserves assignee filter when paging to next month and back', () => {
      const yogiTitle = `Yogi Filter ${Date.now()}`;
      const riddhiTitle = `Riddhi Filter ${Date.now()}`;
      createTask({
        title: yogiTitle,
        assignedTo: 'Yogi',
        taskDate: fmt(nextMonthDate),
      }).then(() => {
        createTask({
          title: riddhiTitle,
          assignedTo: 'Riddhi',
          taskDate: fmt(nextMonthDate),
        }).then(() => {
          cy.visit('http://localhost:3000/tasks');

          cy.get('[data-testid="upcoming-task-list"]')
            .contains('label', 'Assignee')
            .parent()
            .find('[role="combobox"]')
            .click();
          cy.get('ul[role="listbox"]').contains('Yogi').click();

          cy.get('[data-testid="month-nav-next"]').click();
          cy.get('[data-testid="upcoming-task-list"]').should(
            'contain',
            yogiTitle,
          );
          cy.get('[data-testid="upcoming-task-list"]').should(
            'not.contain',
            riddhiTitle,
          );

          cy.get('[data-testid="month-nav-current"]').click();

          cy.get('[data-testid="upcoming-task-list"]')
            .contains('label', 'Assignee')
            .parent()
            .find('[role="combobox"]')
            .should('contain', 'Yogi');
        });
      });
    });
  });

  describe('Empty state', () => {
    it('shows empty message when paged month has no tasks', () => {
      cy.visit('http://localhost:3000/tasks');
      cy.get('[data-testid="month-nav-next"]').click();
      cy.get('[data-testid="month-nav-next"]').click();
      cy.get('[data-testid="month-nav-next"]').click();
      cy.get('[data-testid="no-tasks-message"]').should('be.visible');
    });
  });
});
