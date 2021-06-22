import {useEffect, useRef} from 'react'
import {MeetingTypeEnum} from '~/__generated__/NewMeeting_viewer.graphql'
import {commitLocalUpdate} from 'react-relay'
import isTempId from '../utils/relay/isTempId'
import {setActiveTemplate} from '../utils/relay/setActiveTemplate'
import useAtmosphere from './useAtmosphere'

const useActiveTopTemplate = (
  edges: readonly {node: {id: string}}[],
  selectedTemplateId: string,
  teamId: string,
  isActive: boolean,
  meetingType: MeetingTypeEnum
) => {
  const atmosphere = useAtmosphere()
  const timer = useRef<number | undefined>()
  useEffect(() => {
    window.clearTimeout(timer.current)
    timer.current = undefined
    // use a setTimeout to remove animation jank while the tabs are transitioning
    timer.current = window.setTimeout(() => {
      if (edges.length === 0 || !isActive || isTempId(selectedTemplateId)) return
      const listTemplateIds = edges.map(({node}) => node.id)
      const isSelectedInView = listTemplateIds.includes(selectedTemplateId)
      if (!isSelectedInView) {
        setActiveTemplate(atmosphere, teamId, listTemplateIds[0], meetingType)
        commitLocalUpdate(atmosphere, (store) => {
          store.get(teamId)?.setValue('', 'editingScaleId')
        })
      }
    }, 300)
  }, [isActive, selectedTemplateId])
}

export default useActiveTopTemplate
