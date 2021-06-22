import {ExternalLinks} from '../../client/types/constEnums'

const makeScoreJiraComment = (
  dimensionName: string,
  finalScore: string,
  meetingName: string,
  discussionURL: string
) => ({
  version: 1,
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: `${dimensionName}: ${finalScore}`,
          marks: [
            {
              type: 'strong'
            }
          ]
        },
        {
          type: 'hardBreak'
        },
        {
          type: 'text',
          text: 'See the discussion',
          marks: [
            {
              type: 'link',
              attrs: {
                href: discussionURL
              }
            }
          ]
        },
        {
          type: 'text',
          text: ` in ${meetingName}.`
        },
        {
          type: 'hardBreak'
        },
        {
          type: 'text',
          text: 'Powered by ',
          marks: [
            {
              type: 'em'
            }
          ]
        },
        {
          type: 'text',
          text: 'Parabol',
          marks: [
            {
              type: 'link',
              attrs: {
                href: ExternalLinks.GETTING_STARTED_SPRINT_POKER
              }
            },
            {
              type: 'em'
            }
          ]
        }
      ]
    }
  ]
})

export default makeScoreJiraComment
