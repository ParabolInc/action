describe('userTaskView', () => {
  beforeEach(() => {
    cy.task('resetDb')
    cy.login()
    cy.visit('/me/tasks')
  })

  afterEach(() => {
    cy.task('resetDb')
  })

  it('shows default team and team member filter on /me/tasks', () => {
    cy.get('[data-cy=team-filter]').should('contain', 'All Teams')
    cy.get('[data-cy=team-filter]').click()
    cy.get('[data-cy="team-filter-l6k4LyKnhP"]').should('contain', 'cypress’s Team')

    cy.get('[data-cy=team-member-filter]').should('contain', 'cypress')
    cy.get('[data-cy=team-member-filter]').click()
    cy.get('[data-cy="team-member-filter-local|CfKdrQVeo"]').should('contain', 'cypress')
  })

  it('updates URL when filters are selected', () => {
    cy.get('[data-cy=team-filter]').click()
    cy.get('[data-cy="team-filter-l6k4LyKnhP"]').click()
    cy.url().should('include', 'teamIds=l6k4LyKnhP')

    cy.get('[data-cy=team-member-filter]').click()
    cy.get('[data-cy="team-member-filter-local|CfKdrQVeo"]').click()
    cy.url().should('include', 'userIds=local|CfKdrQVeo')
  })

  it('filters tasks by team filter', () => {
    // Create a new team
    cy.get('nav')
      .contains('Add a Team')
      .click()
    cy.get('form').within(() => {
      cy.get('input[name="teamName"]').type(`cypress's own team`)
      cy.root().submit()
      cy.location('pathname', {timeout: 10000}).should('match', new RegExp('/team/(.+)'))
      cy.wait(1000)
    })

    cy.url().then((url) => {
      const regex = /.+\/team\/(.+)/
      const newTeamId = url.replace(regex, '$1')
      cy.visit(`/me/tasks?teamIds=${newTeamId}`)

      cy.get('[data-cy=team-filter]').should('contain', `cypress's own team`)
      cy.get('[data-cy=draggable-task-card-editor]').should('not.contain', 'This is a task card')
    })
  })
})
