import React, {lazy, Suspense, useState} from 'react'
import getWordAt from './getWordAt'
import resolvers from './resolvers'
import completeEntity from '../../utils/draftjs/completeEntity'
import getDraftCoords from '../../utils/getDraftCoords'
import getAnchorLocation from './getAnchorLocation'
import {EditorProps, EditorState} from 'draft-js'
import {SetEditorState} from '../../types/draft'
import useForceUpdate from '../../hooks/useForceUpdate'

const EditorSuggestions = lazy(() =>
  import(/* webpackChunkName: 'EditorSuggestions' */ '../EditorSuggestions/EditorSuggestions')
)

const SuggestMentionableUsersRoot = lazy(() =>
  import(/* webpackChunkName: 'SuggestMentionableUsersRoot' */ '../SuggestMentionableUsersRoot')
)

type Handlers = Pick<EditorProps, 'handleReturn' | 'onChange' | 'keyBindingFn'>

interface CustomProps {
  teamId: string
}

interface BaseSuggestion {
  id: string
}

interface TagSuggestion extends BaseSuggestion {
  name: string
}

interface MentionSuggestion extends BaseSuggestion {
  preferredName: string
}

interface Options {
  excludeTags?: boolean
}
export type DraftSuggestion = MentionSuggestion | TagSuggestion

type SuggestionType = 'tag' | 'mention'
const useSuggestions = (
  editorState: EditorState,
  setEditorState: SetEditorState,
  handlers: Handlers & CustomProps,
  options: Options = {}
) => {
  const {keyBindingFn, handleReturn, teamId, onChange} = handlers
  const {excludeTags} = options
  const [active, setActive] = useState<number | undefined>(undefined)
  const [suggestions, _setSuggestions] = useState<DraftSuggestion[]>([])
  const [suggestionType, setSuggestionType] = useState<undefined | SuggestionType>(undefined)
  const [triggerWord, setTriggerWord] = useState('')
  const forceUpdate = useForceUpdate()
  const onRemoveModal = () => {
    setActive(undefined)
    _setSuggestions([])
    setSuggestionType(undefined)
  }

  const setSuggestions = (suggestions: DraftSuggestion[]) => {
    if (suggestions.length === 0) {
      onRemoveModal()
    } else {
      _setSuggestions(suggestions)
    }
  }

  const handleSelect = (idx) => (e) => {
    e.preventDefault()
    const item = suggestions![idx]
    if (suggestionType === 'tag') {
      const {name} = item as TagSuggestion
      setEditorState(completeEntity(editorState, 'TAG', {value: name}, `#${name}`))
    } else if (suggestionType === 'mention') {
      const {id, preferredName} = item as MentionSuggestion
      // team is derived from the task itself, so userId is the real useful thing here
      const [userId] = id.split('::')
      setEditorState(completeEntity(editorState, 'MENTION', {userId}, preferredName))
    }
    onRemoveModal()
  }

  const handleKeyBindingFn: Handlers['keyBindingFn'] = (e) => {
    if (active === undefined) return null
    if (keyBindingFn) {
      keyBindingFn(e)
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(Math.max(active - 1, 0))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(Math.min(active + 1, suggestions!.length - 1))
    } else if (e.key === 'Tab') {
      handleSelect(active)(e)
    }
    return null
  }

  const onHandleReturn: Handlers['handleReturn'] = (e) => {
    if (handleReturn) {
      handleReturn(e, editorState)
    }
    handleSelect(active)(e)
    return 'handled'
  }

  const checkForSuggestions = (word: string) => {
    const trigger = word[0]
    const nextTriggerWord = word.slice(1)
    if (trigger === '#' && !excludeTags) {
      makeSuggestions(nextTriggerWord, 'tag')
      return true
    } else if (trigger === '@') {
      setActive(0)
      setTriggerWord(nextTriggerWord)
      _setSuggestions([])
      setSuggestionType('mention')
      return true
    }
    return false
  }

  const makeSuggestions = async (triggerWord: string, resolveType: SuggestionType) => {
    const resolve = resolvers[resolveType]
    const suggestions = await resolve(triggerWord)
    if (suggestions.length > 0) {
      setActive(0)
      _setSuggestions(suggestions)
      setSuggestionType(resolveType)
    } else {
      onRemoveModal()
    }
  }

  const handleChange = (editorState: EditorState) => {
    if (onChange) {
      onChange(editorState)
    }
    const {block, anchorOffset} = getAnchorLocation(editorState)
    const blockText = block.getText()
    const entityKey = block.getEntityAt(anchorOffset - 1)
    const {word} = getWordAt(blockText, anchorOffset - 1)

    const inASuggestion = word && !entityKey && checkForSuggestions(word)
    if (!inASuggestion && suggestionType) {
      onRemoveModal()
    }
  }

  const renderModal = () => {
    const coords = getDraftCoords()
    if (!coords) {
      setTimeout(forceUpdate)
      return null
    }
    if (suggestionType === 'mention') {
      return (
        <Suspense fallback={''}>
          <SuggestMentionableUsersRoot
            active={active || 0}
            handleSelect={handleSelect}
            setSuggestions={setSuggestions}
            suggestions={suggestions}
            triggerWord={triggerWord}
            teamId={teamId}
            originCoords={coords}
          />
        </Suspense>
      )
    }
    return (
      <Suspense fallback={''}>
        <EditorSuggestions
          active={active || 0}
          suggestions={suggestions}
          suggestionType={'tag'}
          handleSelect={handleSelect}
          originCoords={coords}
        />
      </Suspense>
    )
  }
  return {
    onChange: handleChange,
    renderModal: suggestionType ? renderModal : undefined,
    removeModal: suggestionType ? onRemoveModal : undefined,
    keyBindingFn: suggestionType ? handleKeyBindingFn : keyBindingFn,
    handleReturn: suggestionType ? onHandleReturn : handleReturn
  }
}

export default useSuggestions
