/**
 * A horizontal separator; looks like:
 *  ---------- some text ----------
 *
 */

import React, {Fragment} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV3'
import LabelHeading from '../LabelHeading/LabelHeading'

const SeparatorContainer = styled(LabelHeading)<{margin: string | number | undefined}>(
  ({margin}) => ({
    display: 'flex',
    fontSize: 11,
    margin,
    maxWidth: '100%',
    padding: '16px 0',
    width: '100%'
  })
)

const separatorLineStyles = {
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  flex: 1,
  margin: 'auto'
}

const LeftSeparator = styled('div')({
  ...separatorLineStyles,
  marginRight: 8
})

const RightSeparator = styled('div')({
  ...separatorLineStyles,
  marginLeft: 8
})

const FullSeparator = styled('div')({
  ...separatorLineStyles,
  flex: 1
})

interface Props {
  margin?: string
  text?: string
}

export default ({margin, text}: Props) => (
  <SeparatorContainer margin={margin}>
    {text ? (
      <Fragment>
        <LeftSeparator />
        {text}
        <RightSeparator />
      </Fragment>
    ) : (
      <FullSeparator />
    )}
  </SeparatorContainer>
)
