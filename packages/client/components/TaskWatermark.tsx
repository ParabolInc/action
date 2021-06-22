import React from 'react'
import styled from '@emotion/styled'
import GitHubSVG from './GitHubSVG'
import JiraSVG from './JiraSVG'
import {TaskServiceEnum} from '~/__generated__/UpdateTaskMutation.graphql'

const iconLookup = {
  github: GitHubSVG,
  jira: JiraSVG
}

const WatermarkBlock = styled('div')({
  bottom: 0,
  left: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  right: 0,
  textAlign: 'center',
  top: 0,
  verticalAlign: 'middle',
  opacity: 0.2,
  zIndex: 1,
  '& svg': {
    height: 120,
    width: 120,
    position: 'absolute',
    bottom: -24,
    right: -24
  }
})

interface Props {
  service: TaskServiceEnum | undefined
}
const TaskWatermark = (props: Props) => {
  const {service} = props
  if (!service) return null
  const SVG = iconLookup[service]
  return (
    <WatermarkBlock>
      <SVG />
    </WatermarkBlock>
  )
}

export default TaskWatermark
