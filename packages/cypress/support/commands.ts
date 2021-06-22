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

import {sign} from 'jsonwebtoken'
import {toEpochSeconds} from '../../server/utils/epochTime'
import {Threshold} from '../../client/types/constEnums'

const login = (_overrides = {}) => {
  Cypress.log({
    name: 'login'
  })
  const now = Date.now()
  const exp = toEpochSeconds(now + Threshold.JWT_LIFESPAN)
  const iat = toEpochSeconds(now)
  const tokenObj = {
    sub: 'local|bZgjbfchN',
    aud: 'action',
    iss: window.location.origin,
    exp,
    iat,
    tms: ['l6k4LyKnhP']
  }
  const secret = Buffer.from(Cypress.env('SERVER_SECRET'), 'base64')
  const authToken = sign(tokenObj, secret)
  window.localStorage.setItem('Action:token', authToken)
  cy.visit('/')
  cy.location('pathname').should('eq', '/me')
}

Cypress.Commands.add('login', login)

const postGQL = (body: any) => {
  return cy.request({
    method: 'POST',
    url: 'http://localhost:3000/graphql',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${window.localStorage.getItem('Action:token')}`
    },
    body: body,
    failOnStatusCode: false
  })
}

Cypress.Commands.add('postGQL', postGQL)

declare global {
  namespace Cypress {
    interface Chainable {
      login: () => Chainable
      visitReflect: () => Chainable
      visitPhase: (phase: string, idx?: string) => Chainable<ReturnType<typeof visitPhase>>
      postGQL: (body: any) => ReturnType<typeof postGQL>
      restoreLocalStorageCache: () => Chainable<Element>
      saveLocalStorageCache: () => Chainable<Element>
    }
  }
}

const resizeObserverLoopErrRe = /^ResizeObserver loop limit exceeded/

const propertyErr = /^Cannot read property/

const visitReflect = () => {
  cy.viewport(1280, 720)
  cy.visit('/retrospective-demo/reflect')
  cy.get('[data-cy=start-demo-button]').should('be.visible').click({force: true})
}

const visitPhase = (phase: string, idx = '') => {
  cy.on('uncaught:exception', (err) => {
    if (resizeObserverLoopErrRe.test(err.message)) {
      // return false to prevent the error from
      // failing this test
      expect(err.message).to.include('ResizeObserver loop limit exceeded')

      return false
    }
    if (propertyErr.test(err.message)) {
      // return false to prevent the error from
      // failing this test
      expect(err.message).to.include('Cannot read property')

      return false
    }
    return undefined
  })
  cy.get(`[data-cy=next-phase]`).should('be.visible').dblclick()

  cy.url().should('be.eq', `http://localhost:3000/retrospective-demo/${phase}${idx}`)
}

const click = ($el) => {
  return $el.click()
}

export default click

const LOCAL_STORAGE_MEMORY = {}

Cypress.Commands.add('saveLocalStorageCache', () => {
  Object.keys(localStorage).forEach((key) => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key]
  })
})

Cypress.Commands.add('restoreLocalStorageCache', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key])
  })
})

Cypress.Commands.add('visitReflect', visitReflect)

Cypress.Commands.add('visitPhase', visitPhase)
