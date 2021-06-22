const testArchivedTasksTeamView = (isTaskArchived: boolean) => {
  // shows sidebar and click the team name
  cy.get('nav')
    .contains('cypress')
    .click()
  cy.url().should('include', '/team')

  // click the "Archived Tasks" button in the task header
  cy.get('div')
    .contains('Archived Tasks')
    .click()
  cy.url().should('include', 'archive')
  isTaskArchived
    ? cy.get('body').should('contain', 'This is a task card')
    : cy.get('body').should('contain', 'There are zero archived tasks')

  // click the "Back to Team Tasks" button in the header
  cy.get('div')
    .contains('Back to Team Tasks')
    .click()
  cy.url().should('not.include', 'archive')
  isTaskArchived
    ? cy.get('body').should('not.contain', 'This is a task card')
    : cy.get('body').should('contain', 'This is a task card')
}

const testArchivedTasksTaskView = (isTaskArchived: boolean) => {
  // shows sidebar and click "Tasks" in the menu
  cy.get('nav')
    .contains('Tasks')
    .click()
  cy.url().should('include', 'tasks')
  cy.wait(1000)

  // click "Archived" checkbox
  cy.get('[data-cy=archived-checkbox]').click()
  cy.url().should('include', 'archived=true')
  isTaskArchived
    ? cy.get('body').should('contain', 'This is a task card')
    : cy.get('body').should('contain', 'There are zero archived tasks')

  // toggle "Archived" checkbox
  cy.get('[data-cy=archived-checkbox]').click()
  cy.url().should('not.include', 'archived=true')
  isTaskArchived
    ? cy.get('body').should('not.contain', 'This is a task card')
    : cy.get('body').should('contain', 'This is a task card')
}

describe('archivedTasks', () => {
  beforeEach(() => {
    cy.task('resetDb')
  })

  it('Test showing archived tasks in Team View', () => {
    cy.login()
    testArchivedTasksTeamView(false)
  })

  it('Test archived task checkbox in Task View', () => {
    cy.login()
    testArchivedTasksTaskView(false)
  })

  it('Test archiving a task', () => {
    cy.login()

    // find the task card and archive it by clicking "Set as #archived"
    cy.get('[data-cy=draggable-task-card-tag-button]').click()
    cy.get('[role=menuitem]')
      .contains('archived')
      .click()

    testArchivedTasksTeamView(true)
    testArchivedTasksTaskView(true)

    cy.get('nav')
      .contains('cypress')
      .click()
    cy.get('div')
      .contains('Archived Tasks')
      .click()
    // unarchive the task
    cy.get('button')
      .contains('reply')
      .click()
    cy.wait(1000)

    testArchivedTasksTeamView(false)
    testArchivedTasksTaskView(false)
  })
})
