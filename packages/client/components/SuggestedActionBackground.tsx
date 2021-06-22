import React from 'react'
import styled from '@emotion/styled'
import patternTile from '../styles/theme/images/icon-pattern-tile.svg'
import {DashTimeline} from '../types/constEnums'
import getRotatedBBox from '../utils/getRotatedBBox'

const ROTATION = 15
const BACKGROUND_HEIGHT = 142
const BACKGROUND_WIDTH = DashTimeline.FEED_MAX_WIDTH

const {width, height, xOffset, yOffset} = getRotatedBBox(
  ROTATION,
  BACKGROUND_WIDTH,
  BACKGROUND_HEIGHT
)

const FullBackground = styled('div')({
  backgroundImage: `url(${patternTile})`,
  backgroundRepeat: 'repeat',
  height,
  opacity: 0.35,
  // needs rotate3d to not look blurry
  transform: `translate3d(${-xOffset}px,${yOffset}px,0)rotate3d(0,0,1,-${ROTATION}deg)`,
  transformOrigin: '0 0',
  width,
  position: 'absolute'
})

const ColorBackground = styled(FullBackground)<{backgroundColor: string}>(({backgroundColor}) => ({
  backgroundImage: 'none',
  backgroundColor,
  opacity: 0.5
}))

const BackgroundClip = styled('div')({
  height: BACKGROUND_HEIGHT,
  overflow: 'hidden',
  position: 'relative',
  width: '100%'
})

interface Props {
  backgroundColor: string
}

const SuggestedActionBackground = (props: Props) => {
  const {backgroundColor} = props
  return (
    <BackgroundClip>
      <ColorBackground backgroundColor={backgroundColor} />
      <FullBackground />
    </BackgroundClip>
  )
}

export default SuggestedActionBackground
