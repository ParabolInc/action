import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useEffect, useMemo, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import usePokerDeckLeftEdge from '~/hooks/usePokerDeckLeftEdge'
import useAtmosphere from '../hooks/useAtmosphere'
import useEventCallback from '../hooks/useEventCallback'
import useInitialRender from '../hooks/useInitialRender'
import useLeft from '../hooks/useLeft'
import usePokerCardLocation from '../hooks/usePokerCardLocation'
import PokerAnnounceDeckHoverMutation from '../mutations/PokerAnnounceDeckHoverMutation'
import VoteForPokerStoryMutation from '../mutations/VoteForPokerStoryMutation'
import {BezierCurve, PokerCards} from '../types/constEnums'
import {PokerCardDeck_meeting} from '../__generated__/PokerCardDeck_meeting.graphql'
import PokerCard from './PokerCard'

const Deck = styled('div')<{left: number}>(({left}) => ({
  bottom: 0,
  display: 'flex',
  left,
  position: 'fixed',
  transition: `200ms ${BezierCurve.DECELERATE}`,
  zIndex: 1 // TODO remove. needs to be under bottom bar but above dimension bg
}))

interface Props {
  meeting: PokerCardDeck_meeting
  estimateAreaRef: RefObject<HTMLDivElement>
}

const swipe = {
  translateX: 0,
  lastX: 0, // last position during a move event
  startX: 0, // the X coord at the mouse/touch start
  isSwipe: null as null | boolean // null if unsure true if we're confident the intent is to swipe
}

const UNCERTAINTY_THRESHOLD = 3 // pixels to move along 1 plane until we determine intent
const TILT_M = 0.256 // slope of the tilt
const TILT_B = 5.94 // y-intercept of linreg tilt
const RADIUS_M = 105 // slope of radius
const RADIUS_B = 435 // y-intercept of radius

const PokerCardDeck = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meeting, estimateAreaRef} = props
  const {id: meetingId, isRightDrawerOpen, localStage, showSidebar, viewerMeetingMember} = meeting
  const isSpectating = viewerMeetingMember?.isSpectating
  const stageId = localStage.id!
  const {dimensionRef} = localStage
  const scores = localStage.scores!
  const isVoting = localStage.isVoting!
  const {scale} = dimensionRef!
  const {values: cards} = scale
  const totalCards = cards.length
  const [isCollapsed, setIsCollapsed] = useState(!isVoting)
  const [estimateAreaWidth, showTransition] = usePokerDeckLeftEdge(estimateAreaRef, isVoting)
  const leftEdge = estimateAreaWidth / 2 - PokerCards.WIDTH / 4
  const left = useLeft(PokerCards.WIDTH, isRightDrawerOpen, showSidebar)
  const isInit = useInitialRender()
  useEffect(() => {
    setIsCollapsed(!isVoting)
  }, [isVoting])
  const tilt = isInit ? 0 : TILT_M * totalCards + TILT_B
  const radius = isInit ? 0 : RADIUS_M * totalCards + RADIUS_B
  const maxHidden = isInit ? 1 : PokerCards.MAX_HIDDEN
  const selectedIdx = useMemo(() => {
    const userVote = scores.find(({userId}) => userId === viewerId)
    return userVote ? cards.findIndex(({label}) => label === userVote.label) : undefined
  }, [scores])
  const deckRef = useRef<HTMLDivElement>(null)
  const hoveringCardIdRef = useRef('')
  const {yOffset, initialRotation, rotationPerCard, maxSlide} = usePokerCardLocation(
    totalCards,
    tilt,
    maxHidden,
    radius,
    estimateAreaWidth
  )
  const {onError, onCompleted, submitMutation, submitting, error} = useMutationProps()
  const onMouseEnter = (cardId: string) => () => {
    if (isCollapsed) return
    if (!hoveringCardIdRef.current) {
      PokerAnnounceDeckHoverMutation(atmosphere, {isHover: true, meetingId, stageId})
    }
    hoveringCardIdRef.current = cardId
  }

  const onMouseLeave = (cardId: string) => () => {
    // leave fires before enter, but we want it to happen after
    // this complexity is necessary because we don't care if they enter/leave the deck, but the individual cards. precision counts!
    setTimeout(() => {
      if (hoveringCardIdRef.current === cardId) {
        hoveringCardIdRef.current = ''
        PokerAnnounceDeckHoverMutation(atmosphere, {isHover: false, meetingId, stageId})
      }
    })
  }

  // if we're no longer voting, aggressively collapse the deck on stray clicks
  const handleDocumentClick = useEventCallback((e: MouseEvent) => {
    if (isVoting || isCollapsed || deckRef.current?.contains(e.target as Node) || swipe.isSwipe)
      return
    setIsCollapsed(true)
  })
  useEffect(() => {
    document.addEventListener('touchstart', handleDocumentClick)
    document.addEventListener('click', handleDocumentClick)
  }, [])

  useEffect(() => {
    if (error) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'voteError',
        message: error.message || 'Error submitting vote',
        autoDismiss: 5
      })
    }
  }, [error])

  const vote = (score: string | null) => {
    if (submitting) return
    submitMutation()
    VoteForPokerStoryMutation(atmosphere, {meetingId, stageId, score}, {onError, onCompleted})
  }

  const onMouseUp = useEventCallback((e: MouseEvent | TouchEvent) => {
    const eventType = e.type === 'mouseup' ? 'mousemove' : 'touchmove'
    document.removeEventListener(eventType, onMouseMove)
    setTimeout(() => {
      // timeout to allow the document.click to see that a swipe is happening
      swipe.isSwipe = null
    })
  })

  const onMouseMove = useEventCallback((e: MouseEvent | TouchEvent) => {
    const event = e.type === 'touchmove' ? (e as TouchEvent).touches[0] : (e as MouseEvent)
    const {clientX} = event
    if (swipe.isSwipe === null) {
      const dx = Math.abs(swipe.startX - clientX)
      if (dx > UNCERTAINTY_THRESHOLD) {
        swipe.isSwipe = true
      } else {
        return
      }
    }
    if (!deckRef.current) return
    const movementX = clientX - swipe.lastX
    swipe.lastX = clientX
    const translateX = movementX + swipe.translateX
    swipe.translateX =
      translateX > 0 ? Math.min(translateX, maxSlide) : Math.max(translateX, -maxSlide)
    // forceUpdate()
    // react isn't performant enough to make this smooth using state
    deckRef.current.style.transform = `translateX(${swipe.translateX}px)`
  })

  const onMouseDown = useEventCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (maxSlide === 0 || isCollapsed) return
    const isTouchStart = e.type === 'touchstart'
    let event: {clientX: number; clientY: number}
    if (isTouchStart) {
      document.addEventListener('touchend', onMouseUp, {once: true})
      document.addEventListener('touchmove', onMouseMove)
      event = (e as React.TouchEvent).touches[0]
    } else {
      document.addEventListener('mouseup', onMouseUp, {once: true})
      document.addEventListener('mousemove', onMouseMove)
      event = e as React.MouseEvent
    }
    const {clientX} = event
    swipe.startX = clientX
    swipe.lastX = clientX
    swipe.isSwipe = null
  })
  useEffect(() => {
    if (deckRef.current && (maxSlide === 0 || isCollapsed)) {
      swipe.translateX = 0
      deckRef.current.style.transform = ''
    }
  }, [maxSlide, isCollapsed])
  // const transform = maxSlide > 0 && !isCollapsed ? `translateX(${swipe.translateX}px)` : undefined
  if (isSpectating) return null
  return (
    <Deck
      ref={deckRef}
      left={left}
      // style={{transform}}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
    >
      {cards.map((card, idx) => {
        const isSelected = selectedIdx === idx
        const {label} = card
        const onClick = () => {
          if (swipe.isSwipe) return
          if (isVoting) {
            vote(isSelected ? null : label)
          } else if (isCollapsed) {
            // if the deck is collapsed, expand it
            setIsCollapsed(false)
          } else {
            // if the deck is expanded, collapse it
            setIsCollapsed(true)
            if (!isSelected) {
              // if they pick a new card, update it
              vote(label)
            }
          }
        }
        const rotation = initialRotation + rotationPerCard * idx
        return (
          <PokerCard
            key={card.label}
            showTransition={showTransition}
            yOffset={yOffset}
            rotation={rotation}
            onMouseEnter={onMouseEnter(card.label)}
            onMouseLeave={onMouseLeave(card.label)}
            scaleValue={card}
            idx={idx}
            totalCards={totalCards}
            onClick={onClick}
            isCollapsed={isCollapsed}
            isSelected={isSelected}
            deckRef={deckRef}
            radius={radius}
            leftEdge={leftEdge}
          />
        )
      })}
    </Deck>
  )
}

graphql`
  fragment PokerCardDeckStage on EstimateStage {
    id
    isVoting
    dimensionRef {
      scale {
        values {
          ...PokerCard_scaleValue
          label
        }
      }
    }
    scores {
      userId
      label
    }
  }
`
export default createFragmentContainer(PokerCardDeck, {
  meeting: graphql`
    fragment PokerCardDeck_meeting on PokerMeeting {
      id
      isRightDrawerOpen
      showSidebar
      phases {
        ... on EstimatePhase {
          stages {
            ...PokerCardDeckStage @relay(mask: false)
          }
        }
      }
      localStage {
        ...PokerCardDeckStage @relay(mask: false)
      }
      viewerMeetingMember {
        isSpectating
      }
    }
  `
})
