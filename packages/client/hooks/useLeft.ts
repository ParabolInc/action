import {useMemo} from 'react'
import {DiscussionThreadEnum, NavSidebar} from '~/types/constEnums'
import useInnerWidth from './useInnerWidth'

// calculate the left required to center an item that has position fixed
const useLeft = (itemWidth: number, showRightDrawer: boolean, showSidebar: boolean): number => {
  const innerWidth = useInnerWidth()
  return useMemo(() => {
    const sidebarWidth = showSidebar ? NavSidebar.WIDTH : 0
    const rightDrawerWidth = showRightDrawer ? DiscussionThreadEnum.WIDTH : 0
    const meetingAreaCenter = (innerWidth - sidebarWidth - rightDrawerWidth) / 2
    return sidebarWidth + meetingAreaCenter - itemWidth / 2
  }, [innerWidth, itemWidth, showRightDrawer, showSidebar])
}

export default useLeft
