describe('Task Responsive Rows + Detail Dialog', () => {
  const API = 'http://localhost:5000';
  let categoryId: string;
  let taskId: string;
  const title = `Cypress Responsive ${Date.now()}`;

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
        title,
        categoryId,
        kind: 'event',
        modality: 'none',
        taskDate: new Date().toISOString().split('T')[0],
        timeMode: 'date_only',
        ...overrides,
      })
      .then(({ body }) => {
        taskId = body.id;
        return body;
      });
  };

  const cleanup = () => {
    if (taskId) {
      cy.request({
        method: 'DELETE',
        url: `${API}/api/tasks/${taskId}`,
        failOnStatusCode: false,
      });
    }
  };

  afterEach(() => {
    cleanup();
  });

  describe('Detail dialog', () => {
    it('opens when clicking a task row body', () => {
      createTask().then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title).click();
        cy.get('[data-testid="task-detail-dialog"]').should('be.visible');
        cy.get('[data-testid="task-detail-dialog"]').should('contain', title);
      });
    });

    it('shows all detail fields', () => {
      createTask({ modality: 'physical', location: 'Office' }).then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title).click();
        cy.get('[data-testid="task-detail-dialog"]').within(() => {
          cy.contains('Date').should('exist');
          cy.contains('Assigned To').should('exist');
          cy.contains('Modality').should('exist');
          cy.contains('Kind').should('exist');
          cy.contains('Location').should('exist');
          cy.contains('Office').should('exist');
        });
      });
    });

    it('closes with the close button', () => {
      createTask().then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title).click();
        cy.get('[data-testid="task-detail-dialog"]').should('be.visible');
        cy.get('[data-testid="task-detail-close"]').click();
        cy.get('[data-testid="task-detail-dialog"]').should('not.exist');
      });
    });

    it('closes with Escape key', () => {
      createTask().then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title).click();
        cy.get('[data-testid="task-detail-dialog"]').should('be.visible');
        cy.get('body').type('{esc}');
        cy.get('[data-testid="task-detail-dialog"]').should('not.exist');
      });
    });

    it('shows status for completed tasks', () => {
      createTask().then(() => {
        cy.request('PATCH', `${API}/api/tasks/${taskId}`, {
          status: 'completed',
        }).then(() => {
          cy.visit('http://localhost:3000/tasks');
          cy.get('[data-testid="upcoming-task-list"]')
            .contains('label', 'Status')
            .parent()
            .find('[role="combobox"]')
            .click();
          cy.get('ul[role="listbox"]').contains('Completed').click();
          cy.contains('[data-testid="task-row"]', title).click();
          cy.get('[data-testid="task-detail-dialog"]').should('be.visible');
          cy.get('[data-testid="task-detail-dialog"]').should(
            'contain',
            'Completed',
          );
        });
      });
    });
  });

  describe('Event propagation', () => {
    it('Complete button does NOT open detail dialog', () => {
      createTask().then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.intercept('PATCH', `**/api/tasks/*`).as('updateTask');
        cy.contains('[data-testid="task-row"]', title)
          .find('[data-testid="task-action-complete"]')
          .click();
        cy.wait('@updateTask');
        cy.get('[data-testid="task-detail-dialog"]').should('not.exist');
      });
    });

    it('MoreVert button does NOT open detail dialog', () => {
      createTask().then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title)
          .find('[data-testid="task-action-more"]')
          .click();
        cy.get('[data-testid="task-overflow-menu"]').should('be.visible');
        cy.get('[data-testid="task-detail-dialog"]').should('not.exist');
        cy.get('body').type('{esc}');
      });
    });

    it('Edit from overflow menu opens TaskForm, NOT detail dialog', () => {
      createTask().then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title)
          .find('[data-testid="task-action-more"]')
          .click();
        cy.get('[data-testid="task-menu-edit"]').click();
        cy.get('[data-testid="task-form-dialog"]').should('be.visible');
        cy.get('[data-testid="task-detail-dialog"]').should('not.exist');
        cy.get('[data-testid="task-form-cancel"]').click();
      });
    });

    it('Delete from overflow menu — confirmation dialog does NOT open detail', () => {
      createTask().then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title)
          .find('[data-testid="task-action-more"]')
          .click();
        cy.get('[data-testid="task-action-delete"]').click();
        cy.get('[data-testid="confirm-dialog"]').should('be.visible');
        cy.get('[data-testid="task-detail-dialog"]').should('not.exist');

        cy.get('[data-testid="confirm-dialog-cancel"]').click();
        cy.get('[data-testid="confirm-dialog"]').should('not.exist');
        cy.get('[data-testid="task-detail-dialog"]').should('not.exist');
      });
    });

    it('Cancel from overflow menu — confirmation dialog does NOT open detail', () => {
      createTask().then(() => {
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title)
          .find('[data-testid="task-action-more"]')
          .click();
        cy.get('[data-testid="task-action-cancel"]').click();
        cy.get('[data-testid="confirm-dialog"]').should('be.visible');
        cy.get('[data-testid="task-detail-dialog"]').should('not.exist');

        cy.intercept('PATCH', `**/api/tasks/*`).as('cancelTask');
        cy.get('[data-testid="confirm-dialog-confirm"]').click();
        cy.wait('@cancelTask');
        cy.get('[data-testid="task-detail-dialog"]').should('not.exist');
      });
    });
  });

  describe('Mobile viewport', () => {
    it('renders without overlap at 375px', () => {
      createTask({
        title: 'A task with a fairly long title for mobile testing purposes',
      }).then(() => {
        cy.viewport(375, 667);
        cy.visit('http://localhost:3000/tasks');
        cy.get('[data-testid="task-row"]')
          .first()
          .should('be.visible')
          .within(() => {
            cy.get(
              '[data-testid="task-action-complete"], [data-testid="task-action-more"]',
            ).should('be.visible');
          });
      });
    });

    it('renders without overflow at 320px', () => {
      createTask().then(() => {
        cy.viewport(320, 568);
        cy.visit('http://localhost:3000/tasks');
        cy.get('[data-testid="upcoming-task-list"]').should('be.visible');
        cy.get('[data-testid="task-row"]').first().should('be.visible');
      });
    });

    it('detail dialog is fullscreen on mobile', () => {
      createTask().then(() => {
        cy.viewport(375, 667);
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title).click();
        cy.get('[data-testid="task-detail-dialog"]')
          .find('.MuiDialog-paper')
          .should('have.css', 'width', '375px');
      });
    });
  });

  describe('Desktop layout regression', () => {
    it('preserves horizontal layout at 1280px', () => {
      createTask().then(() => {
        cy.viewport(1280, 800);
        cy.visit('http://localhost:3000/tasks');
        cy.contains('[data-testid="task-row"]', title).should('be.visible');
        cy.get('[data-testid="upcoming-task-list"]').should('exist');
        cy.get('[data-testid="calendar-view"]').should('exist');
      });
    });
  });
});
