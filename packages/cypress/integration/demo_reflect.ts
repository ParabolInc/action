function addCard(column, text) {
  cy.wait(500)
  cy.get(`[data-cy=reflection-column-${column}]`)
    .contains('.DraftEditor-root', 'My reflection')
    .should(($e) => {
      expect($e.find('.public-DraftEditor-content')).to.have.prop('contenteditable', 'true')
    })
    .type('{selectall}')
    .type('{backspace}')
    .type(text)
    .should('have.text', text)
    .type('{enter}')
}

function editCard(column, oldText, newText) {
  cy.get(`[data-cy=reflection-stack-${column}-card-0-root]`)
    .find(`[data-cy=editor-wrapper]`)
    .as('reflection-card-edit')

  cy.get('@reflection-card-edit').should('have.text', `${oldText}`)

  cy.get('@reflection-card-edit')
    .type('{selectall}')
    .type('{backspace}')
    .type(`${newText}`)
    .should('have.text', `${newText}`)
}

function deleteCard(column) {
  cy.get(`[data-cy=reflection-stack-${column}-card-0-root]`).as('reflection-card-delete')

  cy.get('@reflection-card-delete')
    .find(`[data-cy=reflection-delete]`)
    .click()

  cy.get('@reflection-card-delete').should('not.exist')
}

describe('Test Reflect page Demo', () => {
  before(function() {
    // runs before all tests in the block
    cy.visitReflect()
  })

  it('Test help menu toggle', () => {
    cy.get('[data-cy=help-menu-close]').should('not.exist')

    cy.get('[data-cy=tip-menu-toggle]')
      .should('be.visible')
      .click()

    cy.get('[data-cy=help-menu-close]')
      .should('be.visible')
      .pipe(($el) => $el.click())
      .should('not.exist')
  })

  it('Test adding reflections', () => {
    cy.get('[data-cy=sidebar-toggle]')
      .should('be.visible')
      .click({force: true})

    addCard('Start', 'Start testing code before merging')

    cy.wait(500)
    cy.screenshot('parabol-retrospective-add-start-column-reflection-closed-sidebar')
    cy.get('[data-cy=topbar-toggle]')
      .should('be.visible')
      .click({force: true})
    cy.screenshot('parabol-retrospective-add-start-column-reflection-open-sidebar')

    addCard('Stop', 'Stop pushing directly to master')

    cy.wait(500)
    cy.screenshot('parabol-retrospective-add-stop-column-reflection-open-sidebar')
    cy.get('[data-cy=sidebar-toggle]')
      .should('be.visible')
      .click({force: true})
    cy.screenshot('parabol-retrospective-add-stop-column-reflection-closed-sidebar')

    addCard('Continue', 'Continue using code linters')

    cy.wait(500)
    cy.screenshot('parabol-retrospective-add-continue-column-reflection-closed-sidebar')
    cy.get('[data-cy=topbar-toggle]')
      .should('be.visible')
      .click({force: true})
    cy.screenshot('parabol-retrospective-add-continue-column-reflection-open-sidebar')
  })

  it('Test editing reflections', () => {
    editCard('Start', 'Start testing code before merging', 'Start having daily standups')

    cy.screenshot('parabol-retrospective-edit-start-column-reflection-open-sidebar')
    cy.get('[data-cy=sidebar-toggle]')
      .should('be.visible')
      .click({force: true})
    cy.screenshot('parabol-retrospective-edit-start-column-reflection-closed-sidebar')

    editCard('Stop', 'Stop pushing directly to master', 'Stop creating merge conflicts')

    cy.screenshot('parabol-retrospective-edit-stop-column-reflection-closed-sidebar')
    cy.get('[data-cy=topbar-toggle]')
      .should('be.visible')
      .click({force: true})
    cy.screenshot('parabol-retrospective-edit-stop-column-reflection-open-sidebar')

    editCard('Continue', 'Continue using code linters', 'Continue using best practices')

    cy.screenshot('parabol-retrospective-edit-continue-column-reflection-open-sidebar')
    cy.get('[data-cy=sidebar-toggle]')
      .should('be.visible')
      .click({force: true})
    cy.screenshot('parabol-retrospective-edit-continue-column-reflection-closed-sidebar')
  })

  it('Test deleting reflections', () => {
    deleteCard('Start')

    deleteCard('Stop')

    deleteCard('Continue')
  })

  it('Test if can advance to groups', () => {
    cy.visitPhase('group')
  })
})
