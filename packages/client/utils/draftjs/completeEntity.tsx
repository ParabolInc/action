import {ContentState, EditorState, Modifier, SelectionState} from 'draft-js'
import getAnchorLocation from '../../components/TaskEditor/getAnchorLocation'
import getWordAt from '../../components/TaskEditor/getWordAt'

const operationTypes = {
  EMOJI: {
    editorChangeType: 'apply-entity',
    entityType: 'IMMUTABLE'
  },
  TAG: {
    editorChangeType: 'apply-entity',
    entityType: 'IMMUTABLE'
  },
  LINK: {
    editorChangeType: 'apply-entity',
    entityType: 'MUTABLE'
  },
  MENTION: {
    editorChangeType: 'apply-entity',
    entityType: 'SEGMENTED'
  }
}

const getExpandedSelectionState = (editorState: EditorState) => {
  const selectionState = editorState.getSelection()
  if (selectionState.isCollapsed()) {
    const {block, anchorOffset} = getAnchorLocation(editorState)
    const {begin, end} = getWordAt(block.getText(), anchorOffset - 1)
    return selectionState.merge({
      anchorOffset: begin,
      focusOffset: end
    }) as SelectionState
  }
  return selectionState as SelectionState
}

export const makeContentWithEntity = (
  contentState: ContentState,
  selectionState: SelectionState,
  mention: string,
  entityKey: string
) => {
  if (!mention) {
    // anchorKey && focusKey should be different here (used for EditorLinkChanger)
    return Modifier.applyEntity(contentState, selectionState, entityKey)
  }
  return Modifier.replaceText(contentState, selectionState, mention, undefined, entityKey)
}

export const autoCompleteEmoji = (editorState: EditorState, emoji: string) => {
  const contentState = editorState.getCurrentContent()
  const expandedSelectionState = getExpandedSelectionState(editorState)

  const nextContentState = Modifier.replaceText(contentState, expandedSelectionState, emoji)
  const endKey = nextContentState.getSelectionAfter().getEndKey()
  const endOffset = nextContentState.getSelectionAfter().getEndOffset()
  const collapsedSelectionState = expandedSelectionState.merge({
    anchorKey: endKey,
    anchorOffset: endOffset,
    focusKey: endKey,
    focusOffset: endOffset
  })
  const finalContent = nextContentState.merge({
    selectionAfter: collapsedSelectionState
    // selectionBefore: collapsedSelectionState,
  }) as ContentState
  return EditorState.push(editorState, finalContent, 'remove-characters' as any)
}

interface Options {
  keepSelection?: boolean
}
const completeEntity = (
  editorState: EditorState,
  entityName: string,
  entityData: any,
  mention: string,
  options: Options = {}
) => {
  const {keepSelection} = options
  const {editorChangeType, entityType} = operationTypes[entityName]
  const contentState = editorState.getCurrentContent()
  const contentStateWithEntity = contentState.createEntity(entityName, entityType, entityData)
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
  const expandedSelectionState = keepSelection
    ? editorState.getSelection()
    : getExpandedSelectionState(editorState)
  const contentWithEntity = makeContentWithEntity(
    contentState,
    expandedSelectionState,
    mention,
    entityKey
  )
  const endKey = contentWithEntity.getSelectionAfter().getEndKey()
  const endOffset = contentWithEntity.getSelectionAfter().getEndOffset()
  const collapsedSelectionState = expandedSelectionState.merge({
    anchorKey: endKey,
    anchorOffset: endOffset,
    focusKey: endKey,
    focusOffset: endOffset
  })
  const finalContent = contentWithEntity.merge({
    selectionAfter: collapsedSelectionState
  }) as ContentState
  return EditorState.push(editorState, finalContent, editorChangeType)
}

export default completeEntity
