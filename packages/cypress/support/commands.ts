// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import {toEpochSeconds} from '../../server/utils/epochTime'
import {JWT_LIFESPAN} from '../../server/utils/serverConstants'
import {sign} from 'jsonwebtoken'

const login = (_overrides = {}) => {
  Cypress.log({
    name: 'login'
  })
  const now = Date.now()
  const exp = toEpochSeconds(now + JWT_LIFESPAN)
  const iat = toEpochSeconds(now)
  const tokenObj = {
    sub: 'local|wnVeDjF-n',
    aud: 'action',
    iss: window.location.origin,
    exp,
    iat,
    tms: []
  }
  const secret = Buffer.from(Cypress.env('SERVER_SECRET'), 'base64')
  const authToken = sign(tokenObj, secret)
  window.localStorage.setItem('Action:token', authToken)
  cy.visit('/')
  cy.location('pathname').should('eq', '/me')
}

Cypress.Commands.add('login', login)

declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login
    }
  }
}

const visitReflect = () => {
  cy.viewport('macbook-15')
  cy.visit('/retrospective-demo/reflect')
  cy.get('[data-cy=start-demo-button]')
    .should('be.visible')
    .click()
    .then(() => {
      cy.get('[data-cy=sidebar-header]')
        .find('button')
        .click()
    })
}

const resizeObserverLoopErrRe = /^ResizeObserver loop limit exceeded/

const visitPhase = (phase: string, idx = '') => {
  cy.on('uncaught:exception', (err) => {
    if (resizeObserverLoopErrRe.test(err.message)){
      // return false to prevent the error from
      // failing this test
      expect(err.message).to.include('ResizeObserver loop limit exceeded')

      return false
    }
  })

  cy.get(`[data-cy=next-${phase}]:not(:disabled)`)
    .should('be.visible')
    .pipe(click)
    .should(($el) => {
      expect($el).to.not.exist
    })

  cy.url().should('be.eq', `http://localhost:3000/retrospective-demo/${phase}${idx}`)
}

const click = ($el) => {
  return $el.click()
}

Cypress.Commands.add('visitReflect', visitReflect)

Cypress.Commands.add('visitPhase', visitPhase)
