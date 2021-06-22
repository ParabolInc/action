import j from 'jscodeshift/src/core'

const parseArgs = require('minimist')
const fs = require('fs')
const path = require('path')
const tsParser = require('jscodeshift/parser/ts')

const PROJECT_ROOT = path.join(__dirname, '../../')

const createServerMutation = (mutationName: string, subscription?: string) => {
  const MUTATIONS_ROOT = path.join(PROJECT_ROOT, 'packages', 'server', 'graphql', 'mutations')
  const mutationPath = path.join(MUTATIONS_ROOT, `${mutationName}.ts`)

  if (fs.existsSync(mutationPath)) {
    console.log('mutation already exists! aborting...')
    // return
  }

  const baseMutation = fs.readFileSync(
    path.join(PROJECT_ROOT, 'scripts/codeshift', 'baseMutation.ts'),
    'utf-8'
  )
  const ast = j(baseMutation, {parser: tsParser()})
  // rename mutation
  ast.findVariableDeclarators('MUTATION_NAME').renameTo(mutationName)
  // rename export
  ast.find(j.ExportDefaultDeclaration).forEach((path) => {
    path.value.declaration.name = mutationName
  })

  // add payload import statement
  const payloadName = mutationName[0].toUpperCase() + mutationName.slice(1) + 'Payload'
  ast
    .find(j.ImportDeclaration)
    .at(-1)
    .insertBefore(`import ${payloadName} from '../types/${payloadName}'`)
    .insertBefore(`import {SubscriptionChannel} from 'parabol-client/types/constEnums'`)

  // add payload as type
  ast.find(j.StringLiteral, {value: 'TYPE'}).replaceWith(`GraphQLNonNull(${payloadName})`)
  // add the publisher
  if (subscription) {
    const channel = `SubscriptionChannel.${subscription.toUpperCase()}`
    const variable = subscription.toLowerCase() + 'Id'
    const success = payloadName.replace('Payload', 'Success')
    ast
      .find(j.ReturnStatement)
      // .insertBefore(`const data = {${variable}}`)
      .insertBefore(`publish(${channel}, ${variable}, '${success}', data, subOptions)`)
    ast.findVariableDeclarators('data').replaceWith(`data = {${variable}}`)
  }

  const res = ast.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })

  fs.writeFileSync(mutationPath, res)
}

const createServerMutationPayload = (mutationName: string) => {
  const payloadName = mutationName[0].toUpperCase() + mutationName.slice(1) + 'Payload'
  const success = payloadName.replace('Payload', 'Success')
  // simple string replacement
  const basePayload = fs.readFileSync(
    path.join(PROJECT_ROOT, 'scripts/codeshift', 'basePayload.ts'),
    'utf-8'
  )
  const nextPayload = basePayload
    .replace(/MUTATION_PAYLOAD/g, payloadName)
    .replace(/SUCCESS_PAYLOAD/g, success)
  const TYPES_ROOT = path.join(PROJECT_ROOT, 'packages', 'server', 'graphql', 'types')
  const payloadPath = path.join(TYPES_ROOT, `${payloadName}.ts`)
  fs.writeFileSync(payloadPath, nextPayload)
}

const addToRootMutation = (mutationName: string) => {
  const rootMutationPath = path.join(
    PROJECT_ROOT,
    'packages',
    'server',
    'graphql',
    'rootMutation.ts'
  )
  const rootMutation = fs.readFileSync(rootMutationPath, 'utf-8')
  const ast = j(rootMutation, {parser: tsParser()})
  const alreadyImported =
    ast.find(j.ImportDeclaration, {
      specifiers: [
        {
          local: {
            name: mutationName
          }
        }
      ]
    }).length > 0
  if (alreadyImported) {
    console.log('Already imported into rootMutation')
    return
  }

  ast
    .find(j.ImportDeclaration)
    .at(-1)
    .insertBefore(`import ${mutationName} from './mutations/${mutationName}'`)

  const objectPath = ast
    .find(j.ObjectExpression)
    .at(1)
    .get()
  const entry = j.objectProperty.from({
    key: j.identifier(mutationName),
    value: j.identifier(mutationName),
    shorthand: true
  })
  objectPath.value.properties.push(entry)

  const res = ast.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })
  fs.writeFileSync(rootMutationPath, res)
}

const addToRootSubscription = (mutationName: string, subscription?: string) => {
  if (!subscription) return
  const fileName = subscription[0].toUpperCase() + subscription.slice(1) + 'SubscriptionPayload.ts'
  const subPath = path.join(PROJECT_ROOT, 'packages', 'server', 'graphql', 'types', fileName)
  const sub = fs.readFileSync(subPath, 'utf-8')
  const payloadName = mutationName[0].toUpperCase() + mutationName.slice(1) + 'Payload'
  const successName = payloadName.replace('Payload', 'Success')
  const ast = j(sub, {parser: tsParser()})
  const alreadyImported =
    ast.find(j.ImportDeclaration, {
      specifiers: [
        {
          local: {
            name: successName
          }
        }
      ]
    }).length > 0
  if (alreadyImported) {
    console.log('Already imported into rootMutation')
    return
  }
  // add import
  ast
    .find(j.ImportDeclaration)
    .at(-1)
    .insertBefore(`import {${successName}} from './${payloadName}'`)

  const payloadArr = ast.find(j.ArrayExpression).get()
  payloadArr.value.elements.push(j.identifier(successName))
  const res = ast.toSource({
    objectCurlySpacing: false,
    quote: 'single'
  })
  fs.writeFileSync(subPath, res)
}

const createClientMutation = (mutationName: string, subscription?: string) => {
  const lowercaseSub = subscription?.toLowerCase() ?? 'part'
  const pascalMutation = mutationName[0].toUpperCase() + mutationName.slice(1)
  const fileName = pascalMutation + 'Mutation.ts'
  const mutationPath = path.join(PROJECT_ROOT, 'packages/client/mutations', fileName)

  const basePath = path.join(PROJECT_ROOT, 'scripts/codeshift', 'baseClientMutation.ts')
  const baseStr = fs.readFileSync(basePath, 'utf-8')
  const nextStr = baseStr
    .replace(/PASCAL_MUTATION/g, pascalMutation)
    .replace(/MUTATION_NAME/g, mutationName)
    .replace(/LCASE_SUB/g, lowercaseSub)
  fs.writeFileSync(mutationPath, nextStr)
}

const addToClientSubscription = (mutationName: string, subscription?: string) => {
  if (!subscription) return
  const lowerSubscription = subscription.toLowerCase()
  const fileName = subscription[0].toUpperCase() + subscription.slice(1) + 'Subscription.ts'
  const subPath = path.join(PROJECT_ROOT, 'packages/client/subscriptions', fileName)
  const pascalMutation = mutationName[0].toUpperCase() + mutationName.slice(1) + 'Mutation'
  const fragment = `      ...${pascalMutation}_${lowerSubscription} @relay(mask: false)`
  const subStr = fs.readFileSync(subPath, 'utf-8')
  const typename = '__typename'
  const nextStr = subStr.replace(typename, typename + '\n' + fragment)
  fs.writeFileSync(subPath, nextStr)
}
const newMutation = () => {
  const argv = parseArgs(process.argv.slice(2), {
    alias: {
      s: 'subscription',
      f: 'field'
    }
  })

  const rawMutationName = argv._[0]
  if (!rawMutationName) {
    console.log('Please provide a mutation name as the first argument')
    return
  }
  const mutationName = rawMutationName[0].toLowerCase() + rawMutationName.slice(1)
  const subscription = argv.subscription
  createServerMutation(mutationName, subscription)
  createServerMutationPayload(mutationName)

  addToRootSubscription(mutationName, subscription)
  addToRootMutation(mutationName)

  createClientMutation(mutationName, subscription)
  addToClientSubscription(mutationName, subscription)
}
newMutation()
