import React, {MouseEvent} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV3'
import FlatButton from './FlatButton'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'
import Icon from './Icon'
import RetroPrompt from './RetroPrompt'
import {Breakpoint} from '~/types/constEnums'
import useBreakpoint from '~/hooks/useBreakpoint'

const AddReflectionButton = styled(FlatButton)({
  border: 0,
  height: 24,
  lineHeight: '24px',
  padding: 0,
  width: 24
})

const ExpandButton = styled(AddReflectionButton)({
  marginLeft: 4
})

const ButtonGroup = styled('div')({
  alignItems: 'flex-start',
  display: 'flex'
})

const ColumnColorDrop = styled('div')<{groupColor: string}>(({groupColor}) => ({
  backgroundColor: groupColor,
  borderRadius: '50%',
  boxShadow: `0 0 0 1px ${PALETTE.SLATE_200}`,
  marginRight: 8,
  height: 8,
  minWidth: 8
}))

const ColumnHeader = styled('div')({
  color: PALETTE.SLATE_700,
  display: 'flex',
  justifyContent: 'space-between',
  lineHeight: '24px',
  margin: '0 auto',
  padding: '12px 12px 0px',
  width: '100%'
})

const Prompt = styled(RetroPrompt)({
  alignItems: 'center',
  display: 'flex',
  marginRight: 8
})

const Wrapper = styled('div')({
  width: '100%'
})

const StyledIcon = styled(Icon)({
  transform: 'rotate(45deg)'
})

interface Props {
  canAdd: boolean
  groupColor: string
  isWidthExpanded: boolean
  onClick: () => void
  phaseType: string | null
  question: string
  submitting: boolean
  toggleWidth: (e: MouseEvent<Element>) => void
}

const GroupingKanbanColumnHeader = (props: Props) => {
  const {
    canAdd,
    groupColor,
    isWidthExpanded,
    onClick,
    question,
    phaseType,
    submitting,
    toggleWidth
  } = props
  const {
    tooltipPortal: addReflectionPortal,
    openTooltip: openReflectionTooltip,
    closeTooltip: closeReflectionTooltip,
    originRef: addReflectionRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_CENTER)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )
  const handleClick = () => {
    onClick()
    closeReflectionTooltip()
  }

  return (
    <Wrapper>
      <ColumnHeader>
        <Prompt>
          <ColumnColorDrop groupColor={groupColor} />
          {question}
        </Prompt>
        <ButtonGroup>
          {phaseType === 'group' && (
            <AddReflectionButton
              dataCy={`add-reflection-${question}`}
              aria-label={'Add a reflection'}
              disabled={!canAdd}
              onClick={handleClick}
              onMouseEnter={openReflectionTooltip}
              onMouseLeave={closeReflectionTooltip}
              ref={addReflectionRef}
              waiting={submitting}
            >
              <Icon>add</Icon>
            </AddReflectionButton>
          )}
          {addReflectionPortal(<div>Add new reflection</div>)}
          {isDesktop && (
            <>
              <ExpandButton
                onClick={toggleWidth}
                onMouseEnter={openTooltip}
                onMouseLeave={closeTooltip}
                ref={originRef}
              >
                <StyledIcon>{isWidthExpanded ? 'unfold_less' : 'unfold_more'}</StyledIcon>
              </ExpandButton>
              {tooltipPortal(<div>{`${isWidthExpanded ? 'Minimise' : 'Expand'}`}</div>)}
            </>
          )}
        </ButtonGroup>
      </ColumnHeader>
    </Wrapper>
  )
}

export default GroupingKanbanColumnHeader
