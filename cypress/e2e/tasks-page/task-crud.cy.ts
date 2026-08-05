describe('Task CRUD (real backend + database)', () => {
  const uniqueTitle = `Cypress Task ${Date.now()}`;

  beforeEach(() => {
    cy.visit('http://localhost:3000/tasks');
  });

  it('loads the tasks page with upcoming list and calendar', () => {
    cy.get('[data-testid="tasks-home-page"]').should('exist');
    cy.get('[data-testid="upcoming-task-list"]').should('exist');
    cy.get('[data-testid="calendar-view"]').should('exist');
  });

  it('creates a one-time task via the form, verifies it appears, then cleans up', () => {
    cy.get('[data-testid="create-task-fab"]').click();
    cy.get('[data-testid="task-form-dialog"]').should('be.visible');

    cy.get('[data-testid="task-title-input"]').find('input').type(uniqueTitle);

    // Category is required
    cy.get('[data-testid="task-form-dialog"]')
      .contains('label', 'Category')
      .parent()
      .find('[role="combobox"]')
      .click();
    cy.get('ul[role="listbox"] li').first().click();

    cy.intercept('POST', '**/api/tasks').as('createTask');
    cy.get('[data-testid="task-form-submit"]').click();

    cy.wait('@createTask').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);

      const taskId = response?.body.id;
      expect(taskId).to.be.a('string');

      cy.get('[data-testid="task-form-dialog"]').should('not.exist');

      cy.get('[data-testid="upcoming-task-list"]').should(
        'contain',
        uniqueTitle,
      );

      // Clean up
      cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`).then(
        (deleteResponse) => {
          expect(deleteResponse.status).to.eq(204);
        },
      );
    });
  });

  it('completes a task and verifies the status updates', () => {
    // Create a task to act on
    const title = `Cypress Complete ${Date.now()}`;
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
          taskDate: new Date().toISOString().split('T')[0],
          timeMode: 'date_only',
        });
      })
      .then(({ body }) => {
      const taskId = body.id;

      cy.reload();
      cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

      cy.contains('[data-testid="task-row"]', title)
        .find('[data-testid="task-action-complete"]')
        .click();

      cy.contains('[data-testid="task-row"]', title).should(
        'contain',
        'Completed',
      );

      // Clean up
      cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`);
    });
  });

  it('skips a task and un-skips it back to planned', () => {
    const title = `Cypress Skip ${Date.now()}`;
    cy.request('POST', 'http://localhost:5000/api/tasks', {
      assignedTo: 'Yogi',
      title,
      categoryId: null,
      kind: 'event',
      modality: 'none',
      taskDate: new Date().toISOString().split('T')[0],
      timeMode: 'date_only',
    }).then(({ body }) => {
      const taskId = body.id;

      cy.reload();
      cy.contains('[data-testid="task-row"]', title)
        .find('[data-testid="task-action-more"]')
        .click();
      cy.get('[data-testid="task-action-skip"]').click();

      cy.contains('[data-testid="task-row"]', title).should(
        'contain',
        'Skipped',
      );

      cy.contains('[data-testid="task-row"]', title)
        .find('[data-testid="task-action-unskip"]')
        .click();

      cy.contains('[data-testid="task-row"]', title)
        .find('[data-testid="task-action-complete"]')
        .should('exist');

      cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`);
    });
  });

  it('cancels a task with confirmation dialog', () => {
    const title = `Cypress Cancel ${Date.now()}`;
    cy.request('POST', 'http://localhost:5000/api/tasks', {
      assignedTo: 'Yogi',
      title,
      categoryId: null,
      kind: 'event',
      modality: 'none',
      taskDate: new Date().toISOString().split('T')[0],
      timeMode: 'date_only',
    }).then(({ body }) => {
      const taskId = body.id;

      cy.reload();
      cy.contains('[data-testid="task-row"]', title)
        .find('[data-testid="task-action-more"]')
        .click();
      cy.get('[data-testid="task-action-cancel"]').click();

      // Confirm dialog should appear
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-dialog-confirm"]').click();

      cy.contains('[data-testid="task-row"]', title).should(
        'contain',
        'Canceled',
      );

      cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`);
    });
  });

  it('deletes a task with confirmation dialog', () => {
    const title = `Cypress Delete ${Date.now()}`;
    cy.request('POST', 'http://localhost:5000/api/tasks', {
      assignedTo: 'Yogi',
      title,
      categoryId: null,
      kind: 'event',
      modality: 'none',
      taskDate: new Date().toISOString().split('T')[0],
      timeMode: 'date_only',
    }).then(({ body }) => {
      expect(body.id).to.be.a('string');

      cy.reload();
      cy.contains('[data-testid="task-row"]', title)
        .find('[data-testid="task-action-more"]')
        .click();
      cy.get('[data-testid="task-action-delete"]').click();

      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-dialog-confirm"]').click();

      cy.get('[data-testid="upcoming-task-list"]').should('not.contain', title);
    });
  });

  it('dismisses the confirmation dialog with Go Back', () => {
    const title = `Cypress GoBack ${Date.now()}`;
    cy.request('POST', 'http://localhost:5000/api/tasks', {
      assignedTo: 'Yogi',
      title,
      categoryId: null,
      kind: 'event',
      modality: 'none',
      taskDate: new Date().toISOString().split('T')[0],
      timeMode: 'date_only',
    }).then(({ body }) => {
      const taskId = body.id;

      cy.reload();
      cy.contains('[data-testid="task-row"]', title)
        .find('[data-testid="task-action-more"]')
        .click();
      cy.get('[data-testid="task-action-delete"]').click();

      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-dialog-cancel"]').click();
      cy.get('[data-testid="confirm-dialog"]').should('not.exist');

      // Task should still be there
      cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

      cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`);
    });
  });

  it('validates required fields — submit disabled without title', () => {
    cy.get('[data-testid="create-task-fab"]').click();
    cy.get('[data-testid="task-form-submit"]').should('be.disabled');

    cy.get('[data-testid="task-title-input"]').find('input').type('Something');
    // Still disabled without category
    cy.get('[data-testid="task-form-submit"]').should('be.disabled');

    cy.get('[data-testid="task-form-cancel"]').click();
  });

  it('filters tasks by status', () => {
    const title = `Cypress Filter ${Date.now()}`;
    cy.request('POST', 'http://localhost:5000/api/tasks', {
      assignedTo: 'Yogi',
      title,
      categoryId: null,
      kind: 'event',
      modality: 'none',
      taskDate: new Date().toISOString().split('T')[0],
      timeMode: 'date_only',
      status: 'completed',
    }).then(({ body }) => {
      const taskId = body.id;

      cy.request('PATCH', `http://localhost:5000/api/tasks/${taskId}`, {
        status: 'completed',
      });

      cy.reload();
      // Default filter should show planned tasks; completed task may not appear
      // Switch status filter to "All"
      cy.get('[data-testid="upcoming-task-list"]')
        .contains('label', 'Status')
        .parent()
        .find('select, [role="combobox"]')
        .first()
        .click();
      cy.get('li').contains('Completed').click();

      cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

      cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`);
    });
  });

  it('edits a task via the overflow menu and verifies changes persist', () => {
    const title = `Cypress Edit ${Date.now()}`;
    const updatedTitle = `${title} UPDATED`;
    cy.request('GET', 'http://localhost:5000/api/tasks/categories').then(
      ({ body: categories }) => {
        const categoryId = categories[0]?.id;

        cy.request('POST', 'http://localhost:5000/api/tasks', {
          assignedTo: 'Yogi',
          title,
          categoryId,
          kind: 'event',
          modality: 'none',
          taskDate: new Date().toISOString().split('T')[0],
          timeMode: 'date_only',
        }).then(({ body }) => {
          const taskId = body.id;

          cy.reload();
          cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

          // Open overflow menu and click Edit
          cy.contains('[data-testid="task-row"]', title)
            .find('[data-testid="task-action-more"]')
            .click();
          cy.get('[data-testid="task-menu-edit"]').click();

          // Edit dialog should open with the current title
          cy.get('[data-testid="task-form-dialog"]').should('be.visible');
          cy.get('[data-testid="task-title-input"]')
            .find('input')
            .should('have.value', title);

          // Clear and type new title
          cy.get('[data-testid="task-title-input"]')
            .find('input')
            .clear()
            .type(updatedTitle);

          cy.intercept('PATCH', `**/api/tasks/${taskId}`).as('updateTask');
          cy.get('[data-testid="task-form-submit"]').click();

          cy.wait('@updateTask').then(({ response }) => {
            expect(response?.statusCode).to.eq(200);
          });

          cy.get('[data-testid="task-form-dialog"]').should('not.exist');
          cy.get('[data-testid="upcoming-task-list"]').should(
            'contain',
            updatedTitle,
          );

          // Clean up
          cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`);
        });
      },
    );
  });
});
