import React, {ReactNode, useEffect} from 'react'
import styled from '@emotion/styled'
import HelpMenuToggle from './MeetingHelp/HelpMenuToggle'
import Menu from './Menu'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import useTimeout from '../hooks/useTimeout'
import isDemoRoute from '../utils/isDemoRoute'
import useFABPad from '../hooks/useFABPad'
import useAtmosphere from '../hooks/useAtmosphere'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'

interface Props {
  menu: ReactNode
}

const TallMenu = styled(Menu)({
  maxHeight: 320
})

const MeetingHelpToggle = (props: Props) => {
  const {menu} = props
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu(MenuPosition.LOWER_RIGHT)
  const atmosphere = useAtmosphere()
  const demoPauseOpen = useTimeout(1000)
  useEffect(() => {
    if (demoPauseOpen && isDemoRoute()) {
      const {clientGraphQLServer} = (atmosphere as unknown) as LocalAtmosphere
      const {isNew} = clientGraphQLServer
      if (!isNew) {
        togglePortal()
      } else {
        // wait for the startBot event to occur
        clientGraphQLServer.once('startDemo', () => {
          togglePortal()
        })
      }
    }
  }, [demoPauseOpen, togglePortal])
  useFABPad(originRef)
  return (
    <>
      <HelpMenuToggle
        ref={originRef}
        onClick={togglePortal}
        onMouseEnter={(menu as any).type ? (menu as any).type.preload : undefined}
      />
      {menuPortal(
        <TallMenu ariaLabel='Meeting tips' {...menuProps}>
          {menu}
        </TallMenu>
      )}
    </>
  )
}

export default MeetingHelpToggle
