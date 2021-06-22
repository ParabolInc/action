import React, {Component, ReactNode} from 'react'
import styled from '@emotion/styled'
import {BrowserRouter as Router} from 'react-router-dom'

// import RelayStub from './RelayStub'
import {css, Global} from '@emotion/core'
import globalStyles from '../../styles/theme/globalStyles'
import AtmosphereProvider from '../../components/AtmosphereProvider/AtmosphereProvider'

const FullPageWrapper = styled('div')({
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  height: '100vh',
  padding: 16,
  width: '100vw'
})

interface Props {
  children: ReactNode
}

export default class StoryContainer extends Component<Props> {
  render() {
    return (
      <Router>
        <Global
          styles={css`
            ${globalStyles}
          `}
        />
        <AtmosphereProvider>
          {/* <RelayStub> */}
          <FullPageWrapper>{this.props.children}</FullPageWrapper>
          {/* </RelayStub> */}
        </AtmosphereProvider>
      </Router>
    )
  }
}
