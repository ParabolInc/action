import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw} from 'draft-js'
import React, {useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import TaskIntegrationLink from '~/components/TaskIntegrationLink'
import useBreakpoint from '~/hooks/useBreakpoint'
import useEditorState from '~/hooks/useEditorState'
import useTaskChildFocus from '~/hooks/useTaskChildFocus'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import isAndroid from '~/utils/draftjs/isAndroid'
import useAtmosphere from '../hooks/useAtmosphere'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import {ICON_SIZE} from '../styles/typographyV2'
import {GQLType} from '../types/generics'
import convertToTaskContent from '../utils/draftjs/convertToTaskContent'
import {PokerEstimateHeaderCardParabol_stage} from '../__generated__/PokerEstimateHeaderCardParabol_stage.graphql'
import CardButton from './CardButton'
import Icon from './Icon'
import IconLabel from './IconLabel'
import TaskEditor from './TaskEditor/TaskEditor'
const HeaderCardWrapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  padding: isDesktop ? '0px 16px 4px' : '0px 8px 4px'
}))

const HeaderCard = styled('div')({
  alignItems: 'flex-start',
  background: PALETTE.WHITE,
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  display: 'flex',
  padding: '12px 8px 12px 16px',
  maxWidth: 1504, // matches widest dimension column 1600 - padding etc.
  margin: '0 auto',
  width: '100%',
  position: 'relative'
})

const ErrorCard = styled('div')({
  alignItems: 'flex-start',
  background: PALETTE.WHITE,
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  padding: '12px 8px 12px 16px',
  maxWidth: 1504, // matches widest dimension column 1600 - padding etc.
  margin: '0 auto',
  width: '100%'
})

const CardIcons = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const EditorWrapper = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  color: PALETTE.SLATE_700,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  maxHeight: isExpanded ? 300 : 38,
  overflowY: isExpanded ? 'auto' : 'hidden',
  transition: 'all 300ms'
}))

const StyledTaskIntegrationLink = styled(TaskIntegrationLink)({
  color: PALETTE.SKY_500,
  display: 'flex',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  padding: '0 0',
  '&:hover,:focus': {
    textDecoration: 'none'
  },
  marginTop: 4,
  width: 'fit-content'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  paddingLeft: 4
})

const StyledTaskEditor = styled(TaskEditor)({
  width: '100%',
  padding: '0 0',
  lineHeight: 'normal',
  height: 'auto'
})

const Content = styled('div')({
  flex: 1,
  paddingRight: 4
})

const CardTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: '0 0 8px'
})

const CardTitleWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%'
})

const CardDescription = styled('div')({
  color: PALETTE.SLATE_700,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  height: '100%'
})

interface Props {
  stage: PokerEstimateHeaderCardParabol_stage
}

const PokerEstimateHeaderCardParabol = (props: Props) => {
  const {stage} = props
  const story = stage.story as GQLType<typeof stage['story'], 'Task'> | null
  const content = story?.content
  const taskId = story?.id ?? ''
  const atmosphere = useAtmosphere()
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const [editorState, setEditorState] = useEditorState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  useEffect(
    () => () => {
      setIsExpanded(false)
    },
    [taskId]
  )
  const {useTaskChild} = useTaskChildFocus(taskId)
  if (!story) {
    // the Parabol task may have been removed
    return (
      <HeaderCardWrapper isDesktop={isDesktop}>
        <ErrorCard>
          <CardTitleWrapper>
            <CardTitle>{`That story doesn't exist!`}</CardTitle>
          </CardTitleWrapper>
          <CardDescription>
            {`The story was deleted. You can add another story in the Scope phase.`}
          </CardDescription>
        </ErrorCard>
      </HeaderCardWrapper>
    )
  }
  const {teamId, integration} = story
  const onBlur = () => {
    if (isAndroid) {
      const editorEl = editorRef.current
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!value) return
      const initialContentState = editorState.getCurrentContent()
      const initialText = initialContentState.getPlainText()
      if (initialText === value) return
      const updatedTask = {
        id: taskId,
        content: convertToTaskContent(value)
      }
      UpdateTaskMutation(atmosphere, {updatedTask, area: 'meeting'}, {})
      return
    }
    const nextContentState = editorState.getCurrentContent()
    const hasText = nextContentState.hasText()
    if (!hasText) return
    const nextContent = JSON.stringify(convertToRaw(nextContentState))
    if (nextContent === content) return
    const updatedTask = {
      id: taskId,
      content: nextContent
    }
    UpdateTaskMutation(atmosphere, {updatedTask, area: 'meeting'}, {})
  }

  return (
    <HeaderCardWrapper isDesktop={isDesktop}>
      <HeaderCard>
        <Content>
          <EditorWrapper isExpanded={isExpanded} onBlur={onBlur}>
            <StyledTaskEditor
              dataCy={`task`}
              editorRef={editorRef}
              editorState={editorState}
              setEditorState={setEditorState}
              teamId={teamId}
              useTaskChild={useTaskChild}
            />
          </EditorWrapper>
          <StyledTaskIntegrationLink
            dataCy={`task`}
            integration={integration || null}
            showJiraLabelPrefix={false}
          >
            <StyledIcon>launch</StyledIcon>
          </StyledTaskIntegrationLink>
        </Content>
        <CardIcons>
          <CardButton>
            <IconLabel icon='unfold_more' onClick={() => setIsExpanded(!isExpanded)} />
          </CardButton>
        </CardIcons>
      </HeaderCard>
    </HeaderCardWrapper>
  )
}

export default createFragmentContainer(PokerEstimateHeaderCardParabol, {
  stage: graphql`
    fragment PokerEstimateHeaderCardParabol_stage on EstimateStage {
      story {
        ... on Task {
          __typename
          id
          title
          integration {
            service
            ...TaskIntegrationLink_integration
          }
          plaintextContent
          content
          teamId
        }
      }
    }
  `
})
