//  jscodeshift --extensions=tsx,ts,js --parser=tsx -t ./scripts/codeshiftExplicitGql.ts ./packages/client

// if a file uses a graphql tagged template literal, this makes sure that it has an import

import {Transform} from 'jscodeshift/src/core'

const transform: Transform = (fileInfo, api, options) => {
  const j = api.jscodeshift
  const root = j(fileInfo.source)
  root.find(j.TaggedTemplateExpression).forEach((node) => {
    if (node.value.tag.name === 'graphql') {
      const importDecs = root.find(j.ImportDeclaration)
      const exists = importDecs.filter((impNode) => {
        return impNode.value.source.value === 'babel-plugin-relay/macro'
      })
      if (exists.size() > 0) return
      const imports = root.find(j.ImportDeclaration)
      const lineToInsert = `import graphql from 'babel-plugin-relay/macro'`
      const len = imports.length
      if (len) {
        j(imports.at(-1).get()).insertBefore(lineToInsert)
      } else {
        root.get().node.program.body.unshift(lineToInsert)
      }
    }
  })
  return root.toSource({
    objectCurlySpacing: false,
    quote: 'single',
    reuseWhitespace: false
  })
}

module.exports = transform
