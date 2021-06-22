describe('Poker template related backend tests', () => {
  let pokerTemplate

  const constructGraphQLQueryBody = (graphQLquery: string) => {
    return {
      type: 'start',
      payload: {
        query: graphQLquery
      }
    }
  }

  const teamId = 'l6k4LyKnhP'

  beforeEach(() => {
    cy.task('resetDb')
    cy.login()

    const query = `
      mutation {
        addPokerTemplate(teamId: \"${teamId}\") {
          pokerTemplate {
            id
            name
            dimensions {
              name
              templateId
              scale {
                id
              }
            }
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      pokerTemplate = responseData.addPokerTemplate.pokerTemplate
    })
  })

  afterEach(() => {
    cy.task('resetDb')
  })

  it('Add a new poker template', () => {
    assert.strictEqual(pokerTemplate.name, '*New Template', 'Poker template name')
    const dimensions = pokerTemplate.dimensions
    assert.strictEqual(1, dimensions.length, 'Number of new dimension created')
    const dimension = dimensions[0]
    assert.strictEqual('*New Dimension', dimension.name, 'Dimension name')
    assert.strictEqual('fibonacciScale', dimension.scale.id, 'Dimension default scaleId')
    assert.strictEqual(pokerTemplate.id, dimension.templateId, "Dimension's templateId")
  })

  it('Renames a poker template', () => {
    const query = `
      mutation {
        renameMeetingTemplate(templateId: "${pokerTemplate.id}", name: "Renamed") {
          meetingTemplate {
            id
            name
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      const newPokerTemplate = responseData.renameMeetingTemplate.meetingTemplate
      assert.strictEqual(pokerTemplate.id, newPokerTemplate.id, 'Poker template id')
      assert.strictEqual('Renamed', newPokerTemplate.name, 'Poker template name')
    })
  })

  it('Removes a poker template', () => {
    const query = `
      mutation {
        removePokerTemplate(templateId: "${pokerTemplate.id}") {
          pokerTemplate {
            id
            isActive
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      const removedPokerTemplate = responseData.removePokerTemplate.pokerTemplate
      assert.strictEqual(pokerTemplate.id, removedPokerTemplate.id, 'Poker template id')
      assert.strictEqual(removedPokerTemplate.isActive, false)
    })
  })

  it('Add a dimension', () => {
    const query = `
      mutation {
        addPokerTemplateDimension(templateId: "${pokerTemplate.id}") {
          dimension {
            templateId
            name
            isActive
            scale {
              id
            }
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      const newDimension = responseData.addPokerTemplateDimension.dimension
      assert.strictEqual(
        pokerTemplate.id,
        newDimension.templateId,
        'Template id of the newly created dimension'
      )
      assert.strictEqual('*New Dimension #2', newDimension.name, 'Dimension name')
      assert.strictEqual('fibonacciScale', newDimension.scale.id, "Dimension's defaultScaleId")
      assert.strictEqual(true, newDimension.isActive, 'IsActive of dimension')
    })
  })

  it('Add a new scale', () => {
    const query = `
      mutation {
        addPokerTemplateScale(teamId: \"${teamId}\") {
          scale {
            name
            isActive
            values {
              label
            }
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(query)).then((res) => {
      const responseData = res.body.payload.data
      const newScale = responseData.addPokerTemplateScale.scale
      assert.strictEqual('*New Scale #1', newScale.name, 'Scale name')
      assert.strictEqual(true, newScale.isActive, 'IsActive of scale')
      assert.strictEqual(
        newScale.values.length,
        2,
        'The newly created scale should contain two default scale values'
      )
      const labels = newScale.values.map(({label}) => label)
      assert.isTrue(labels.includes('?'), 'Question mark card should be included by default')
      assert.isTrue(labels.includes('X'), 'Pass card should be included by default')
    })
  })

  it('Add a new scale value', () => {
    const addNewScaleQuery = `
      mutation {
        addPokerTemplateScale(teamId: \"${teamId}\") {
          scale {
            id
            name
            isActive
            values {
              label
            }
          }
        }
      }
    `
    cy.postGQL(constructGraphQLQueryBody(addNewScaleQuery)).then((res) => {
      const responseData = res.body.payload.data
      const newScale = responseData.addPokerTemplateScale.scale
      const newScaleValue = {
        color: 'blue',
        value: 1,
        label: '1'
      }
      const addNewScaleValueQuery = `
        mutation($scaleValue: TemplateScaleInput!) {
          addPokerTemplateScaleValue(scaleId: "${newScale.id}", scaleValue: $scaleValue) {
            scale {
              values {
                label
                value
                color
              }
            }
          }
        }
      `
      const requestBody = {
        type: 'start',
        payload: {
          query: addNewScaleValueQuery,
          variables: {
            scaleValue: newScaleValue
          }
        }
      }
      cy.postGQL(requestBody).then((res) => {
        const responseData = res.body.payload.data
        const updatedScale = responseData.addPokerTemplateScaleValue.scale
        const updatedValues = updatedScale.values
        assert.strictEqual(3, updatedValues.length, 'Number of values in the scale')
        const updatedValue = updatedValues[2] // last element
        assert.strictEqual('blue', updatedValue.color, 'Color of the newly added scale value')
        assert.strictEqual(1, updatedValue.value, 'Numerical value of the newly added scale value')
        assert.strictEqual('1', updatedValue.label, 'Label of the newly added scale value')
      })
    })
  })
})
