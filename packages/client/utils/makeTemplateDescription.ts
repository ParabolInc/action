import graphql from 'babel-plugin-relay/macro'
import {readInlineData} from 'relay-runtime'
import {makeTemplateDescription_template} from '../__generated__/makeTemplateDescription_template.graphql'
import relativeDate from './date/relativeDate'

const makeTemplateDescription = (lowestScope: string, templateRef: any) => {
  const template = readInlineData<makeTemplateDescription_template>(
    graphql`
      fragment makeTemplateDescription_template on MeetingTemplate @inline {
        lastUsedAt
        scope
        team {
          name
        }
      }
    `,
    templateRef
  )
  const {lastUsedAt, team} = template
  const {name: teamName} = team
  if (lowestScope === 'TEAM')
    return lastUsedAt ? `Last used ${relativeDate(lastUsedAt, {smallDiff: 'just now'})}` : 'Never used'
  return `Created by ${teamName}`
}

export default makeTemplateDescription
