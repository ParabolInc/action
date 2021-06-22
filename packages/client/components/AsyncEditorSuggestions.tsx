import React, {ComponentType} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import {DraftSuggestion} from './TaskEditor/useSuggestions'

const dontTellDraft = (e) => {
  e.preventDefault()
}

const SuggestionStyles = styled('div')({
  color: PALETTE.SLATE_700
})

interface Props {
  activeIdx: number
  handleSelect: (idx: number) => (e: React.MouseEvent) => void
  suggestions: DraftSuggestion[]
  SuggestionItem: ComponentType<any>
}

const AsyncEditorSuggestions = (props: Props) => {
  const {activeIdx, handleSelect, suggestions, SuggestionItem} = props
  return (
    <SuggestionStyles>
      {suggestions &&
        suggestions.map((suggestion, idx) => {
          return (
            // eslint-disable-next-line
            <div key={idx} onMouseDown={dontTellDraft} onClick={handleSelect(idx)}>
              <SuggestionItem active={activeIdx === idx} {...suggestion} />
            </div>
          )
        })}
    </SuggestionStyles>
  )
}

export default AsyncEditorSuggestions
