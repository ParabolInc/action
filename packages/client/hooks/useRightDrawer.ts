import {useLayoutEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {Breakpoint} from '~/types/constEnums'
import useAtmosphere from './useAtmosphere'
import useBreakpoint from './useBreakpoint'

const useRightDrawer = (meetingId: string) => {
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const toggleDrawer = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const isRightDrawerOpen = meeting.getValue('isRightDrawerOpen')
      const isCommentUnread = meeting.getValue('isCommentUnread')
      if (isRightDrawerOpen && isCommentUnread) {
        meeting.setValue(false, 'isCommentUnread')
      }
      meeting.setValue(!isRightDrawerOpen, 'isRightDrawerOpen')
    })
  }

  const setDrawerOpen = (isOpen: boolean) => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)!
      meeting.setValue(isOpen, 'isRightDrawerOpen')
    })
  }
  useLayoutEffect(() => {
    setDrawerOpen(isDesktop)
    return () => {
      setDrawerOpen(false)
    }
  }, [isDesktop])

  return toggleDrawer
}

export default useRightDrawer
