describe('Series flow (real backend + database)', () => {
  it('creates a recurring series via the form and verifies occurrences appear', () => {
    cy.visit('http://localhost:3000/tasks');

    cy.get('[data-testid="create-task-fab"]').click();
    cy.get('[data-testid="task-form-dialog"]').should('be.visible');

    const title = `Cypress Series ${Date.now()}`;
    cy.get('[data-testid="task-title-input"]').find('input').type(title);

    // Category is required
    cy.get('[data-testid="task-form-dialog"]')
      .contains('label', 'Category')
      .parent()
      .find('[role="combobox"]')
      .click();
    cy.get('ul[role="listbox"] li').first().click();

    // Toggle recurring on
    cy.get('[data-testid="task-recurring-toggle"]').click();

    cy.intercept('POST', '**/api/tasks/series').as('createSeries');
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

      // Clean up: archive the series and cancel generated tasks so they don't leak into other tests
      cy.request(
        'POST',
        `http://localhost:5000/api/tasks/series/${seriesId}/archive`,
      );

      const taskIds = (response?.body.tasks ?? []).map(
        (t: { id: string }) => t.id,
      );
      cy.wrap(taskIds).each((taskId) => {
        cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`)
          .its('status')
          .should('eq', 204);
      });
    });
  });

  it('creates a semi-annual recurring series and verifies the recurrence rule', () => {
    cy.visit('http://localhost:3000/tasks');

    cy.get('[data-testid="create-task-fab"]').click();
    cy.get('[data-testid="task-form-dialog"]').should('be.visible');

    const title = `Cypress Semi-Annual ${Date.now()}`;
    cy.get('[data-testid="task-title-input"]').find('input').type(title);

    // Category is required
    cy.get('[data-testid="task-form-dialog"]')
      .contains('label', 'Category')
      .parent()
      .find('[role="combobox"]')
      .click();
    cy.get('ul[role="listbox"] li').first().click();

    // Toggle recurring on
    cy.get('[data-testid="task-recurring-toggle"]').click();

    // Select "Every 6 months" frequency
    cy.get('[data-testid="task-form-dialog"]')
      .contains('label', 'Frequency')
      .parent()
      .find('[role="combobox"]')
      .click();
    cy.get('ul[role="listbox"]').contains('Every 6 months').click();

    cy.intercept('POST', '**/api/tasks/series').as('createSemiAnnual');
    cy.get('[data-testid="task-form-submit"]').click();

    cy.wait('@createSemiAnnual').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);

      const seriesId = response?.body.series?.id;
      const recurrenceRule = response?.body.series?.recurrenceRule;
      const taskCount = response?.body.tasks?.length;

      expect(recurrenceRule).to.match(/FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=/);
      expect(taskCount).to.be.greaterThan(0);

      cy.get('[data-testid="task-form-dialog"]').should('not.exist');

      // Clean up
      cy.request(
        'POST',
        `http://localhost:5000/api/tasks/series/${seriesId}/archive`,
      );

      const taskIds = (response?.body.tasks ?? []).map(
        (t: { id: string }) => t.id,
      );
      cy.wrap(taskIds).each((taskId) => {
        cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`)
          .its('status')
          .should('eq', 204);
      });
    });
  });

  it('edits a recurring series title via entire-series scope', () => {
    cy.request('GET', 'http://localhost:5000/api/tasks/categories').then(
      ({ body: categories }) => {
        const categoryId = categories[0]?.id;
        const title = `Cypress Edit Series ${Date.now()}`;
        const updatedTitle = `${title} Updated`;
        const today = new Date().toISOString().split('T')[0];

        cy.request('POST', 'http://localhost:5000/api/tasks/series', {
          assignedTo: 'Yogi',
          title,
          categoryId,
          kind: 'event',
          modality: 'none',
          timeMode: 'date_only',
          startsOn: today,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
        }).then(({ body }) => {
          const seriesId = body.series.id;
          const taskIds = (body.tasks ?? []).map((t: { id: string }) => t.id);

          cy.visit('http://localhost:3000/tasks');
          cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

          // Open the task's overflow menu and click edit
          cy.contains('[data-testid="task-row"]', title)
            .first()
            .find('[data-testid="task-action-more"]')
            .click();
          cy.get('[data-testid="task-menu-edit"]').click();

          // Change the title
          cy.get('[data-testid="task-form-dialog"]').should('be.visible');
          cy.get('[data-testid="task-title-input"]')
            .find('input')
            .clear()
            .type(updatedTitle);

          cy.intercept('PATCH', `**/api/tasks/series/${seriesId}`).as(
            'updateSeries',
          );
          cy.get('[data-testid="task-form-submit"]').click();

          // Scope dialog appears after clicking save on a recurring edit
          cy.get('[data-testid="edit-scope-dialog"]').should('be.visible');
          cy.get('[data-testid="edit-scope-series"]').click();
          cy.get('[data-testid="edit-scope-confirm"]').click();

          cy.wait('@updateSeries').then(({ response: updateResp }) => {
            expect(updateResp?.statusCode).to.eq(200);
            expect(updateResp?.body?.title).to.eq(updatedTitle);
          });

          // Verify the updated title appears in the task list
          cy.get('[data-testid="upcoming-task-list"]').should(
            'contain',
            updatedTitle,
          );

          // Clean up
          cy.request(
            'POST',
            `http://localhost:5000/api/tasks/series/${seriesId}/archive`,
          );

          cy.wrap(taskIds).each((taskId) => {
            cy.request({
              method: 'DELETE',
              url: `http://localhost:5000/api/tasks/${taskId}`,
              failOnStatusCode: false,
            });
          });
        });
      },
    );
  });

  it('cancels one occurrence of a recurring series', () => {
    // Create a series via API
    cy.request('GET', 'http://localhost:5000/api/tasks/categories').then(
      ({ body: categories }) => {
        const categoryId = categories[0]?.id;
        const title = `Cypress Cancel Occ ${Date.now()}`;
        const today = new Date().toISOString().split('T')[0];

        cy.request('POST', 'http://localhost:5000/api/tasks/series', {
          assignedTo: 'Yogi',
          title,
          categoryId,
          kind: 'event',
          modality: 'none',
          timeMode: 'date_only',
          startsOn: today,
          recurrenceRule: 'FREQ=DAILY;COUNT=2',
        }).then(({ body }) => {
          const seriesId = body.series.id;
          const taskIds = (body.tasks ?? []).map((t: { id: string }) => t.id);

          cy.visit('http://localhost:3000/tasks');
          cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

          // Cancel the first occurrence (today's task) — open overflow menu first
          cy.contains('[data-testid="task-row"]', title)
            .first()
            .find('[data-testid="task-action-more"]')
            .click();
          cy.get('[data-testid="task-action-cancel"]').click();

          cy.get('[data-testid="confirm-dialog-confirm"]').click();

          cy.contains('[data-testid="task-row"]', title)
            .first()
            .should('contain', 'Canceled');

          // Clean up
          cy.request(
            'POST',
            `http://localhost:5000/api/tasks/series/${seriesId}/archive`,
          );

          cy.wrap(taskIds).each((taskId) => {
            cy.request('DELETE', `http://localhost:5000/api/tasks/${taskId}`)
              .its('status')
              .should('eq', 204);
          });
        });
      },
    );
  });

  it('yearly birthday appears in task list and calendar one year out', () => {
    cy.request('GET', 'http://localhost:5000/api/tasks/categories').then(
      ({ body: categories }) => {
        const categoryId = categories[0]?.id;
        const title = `Cypress Birthday ${Date.now()}`;

        // Pick a date next year for the birthday
        const now = new Date();
        const birthdayDate = new Date(
          now.getFullYear() + 1,
          now.getMonth(),
          15,
        );
        const birthdayStr = birthdayDate.toISOString().split('T')[0];
        const birthdayMonth = birthdayDate.toLocaleString('en-US', {
          month: 'long',
        });
        const birthdayYear = birthdayDate.getFullYear();

        cy.request('POST', 'http://localhost:5000/api/tasks/series', {
          assignedTo: 'Yogi',
          title,
          categoryId,
          kind: 'event',
          modality: 'none',
          timeMode: 'date_only',
          startsOn: birthdayStr,
          recurrenceRule: 'FREQ=YEARLY',
        }).then(({ body }) => {
          const seriesId = body.series.id;
          const taskIds = (body.tasks ?? []).map((t: { id: string }) => t.id);

          expect(body.tasks.length).to.be.greaterThan(0);

          cy.visit('http://localhost:3000/tasks');

          // Navigate the task list to the birthday's month using month nav
          // Calculate how many months forward we need to go
          const monthsForward =
            (birthdayDate.getFullYear() - now.getFullYear()) * 12 +
            (birthdayDate.getMonth() - now.getMonth());
          for (let i = 0; i < monthsForward; i++) {
            cy.get('[data-testid="month-nav-next"]').click();
          }

          // Verify the birthday shows in the upcoming task list
          cy.get('[data-testid="upcoming-task-list"]').should('contain', title);

          // Navigate the calendar to the birthday's year/month
          // Click the month/year header to open the year picker
          cy.get('[data-testid="calendar-view"]')
            .find('.MuiPickersCalendarHeader-label')
            .click();

          // Select the correct year — MUI returns to day view automatically
          cy.get('.MuiYearCalendar-root')
            .contains(birthdayYear.toString())
            .click();

          // Wait for the day view to render after year selection
          cy.get('[data-testid="calendar-view"]')
            .find('button.MuiPickersDay-root')
            .should('exist');

          // Navigate with month arrows if needed to reach the right month
          cy.get('[data-testid="calendar-view"]')
            .find('.MuiPickersCalendarHeader-label')
            .invoke('text')
            .then((headerText) => {
              if (!headerText.includes(birthdayMonth)) {
                const headerMonth = new Date(
                  Date.parse(headerText + ' 1'),
                ).getMonth();
                const targetMonth = birthdayDate.getMonth();
                const diff = targetMonth - headerMonth;
                const button =
                  diff > 0
                    ? 'button[aria-label="Next month"]'
                    : 'button[aria-label="Previous month"]';
                for (let i = 0; i < Math.abs(diff); i++) {
                  cy.get('[data-testid="calendar-view"]').find(button).click();
                  cy.wait(300);
                }
              }
            });

          // Click on day 15 (the birthday date)
          cy.get('[data-testid="calendar-view"]')
            .find('button.MuiPickersDay-root')
            .contains(/^15$/)
            .click();

          // Verify the badge dot exists on day 15 (badge is NOT invisible)
          cy.get('[data-testid="calendar-view"]')
            .find('button.MuiPickersDay-root')
            .contains(/^15$/)
            .closest('.MuiBadge-root')
            .find('.MuiBadge-dot')
            .should('be.visible');

          // Verify the calendar day detail panel shows the birthday
          cy.get('[data-testid="calendar-day-detail"]').should(
            'contain',
            title,
          );

          // Clean up
          cy.request(
            'POST',
            `http://localhost:5000/api/tasks/series/${seriesId}/archive`,
          );

          cy.wrap(taskIds).each((taskId) => {
            cy.request({
              method: 'DELETE',
              url: `http://localhost:5000/api/tasks/${taskId}`,
              failOnStatusCode: false,
            });
          });
        });
      },
    );
  });
});
