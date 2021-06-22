import * as Sentry from '@sentry/browser'
import {convertFromRaw, EditorState} from 'draft-js'
import {useEffect, useRef, useState} from 'react'
import makeEditorState from '../utils/draftjs/makeEditorState'
import mergeServerContent from '../utils/mergeServerContent'

const useEditorState = (content?: string | null | undefined) => {
  const [editorState, setEditorState] = useState<EditorState>(() =>
    makeEditorState(content, () => editorStateRef.current!)
  )
  const editorStateRef = useRef<EditorState>(editorState)
  const isErrorSentToSentryRef = useRef<boolean>(false)
  const lastFiredRef = useRef<Date | null>(null)
  const initialRender = useRef(true)
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    if (!content) return
    const parsedContent = JSON.parse(content)
    if (!parsedContent.blocks) return
    const editorStateContent = editorStateRef.current.getCurrentContent()
    const editorStateBlock = editorStateContent.getLastBlock()
    const editorStateKey = editorStateBlock.getKey()
    const editorStateText = editorStateContent.getPlainText()
    const nextContentState = convertFromRaw(parsedContent)
    const newContentState = mergeServerContent(editorState, nextContentState)
    editorStateRef.current = EditorState.push(editorState, newContentState, 'insert-characters')

    const now = new Date()
    const diff = lastFiredRef.current && now.getTime() - lastFiredRef.current.getTime()

    // prevent nasty infinite loop bug: https://sentry.io/organizations/parabol/issues/1641789488
    const minTime = 20
    if (diff && diff < minTime) {
      if (!isErrorSentToSentryRef.current) {
        const error = {
          parsedContent,
          editorStateText,
          editorStateKey,
          timeSinceLastRender: diff
        }
        Sentry.captureException(new Error(`useEditorState fired in last ${minTime}ms. ${error}`))
        isErrorSentToSentryRef.current = true
      }
      return
    }

    lastFiredRef.current = now
    setEditorState(editorStateRef.current)
  }, [content])

  return [editorState, setEditorState] as [EditorState, (editorState: EditorState) => void]
}

export default useEditorState
