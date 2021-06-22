declare namespace Cypress {
  interface Chainable {
    restoreLocalStorageCache(): Chainable<Element>
    saveLocalStorageCache(): Chainable<Element>
  }
}
