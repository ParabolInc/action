import UserAgent from 'fbjs/lib/UserAgent'
import React from 'react'
import styled from '@emotion/styled'
import IconButton from '../IconButton'
import IconLabel from '../IconLabel'
import {PALETTE} from '../../styles/paletteV3'
import {Radius} from '../../types/constEnums'

const isOSX = UserAgent.isPlatform('Mac OS X')
const modKey = isOSX ? '⌘' : 'ctrl'

const ModalHeader = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  justifyContent: 'center',
  lineHeight: 1.5,
  padding: '16px 0 4px',
  position: 'relative'
})

const ModalHeaderIcon = styled('div')({
  // Define
})

const ModalHeaderTitle = styled('div')({
  fontSize: 20,
  marginLeft: 16
})

const CloseButton = styled(IconButton)({
  height: 24,
  lineHeight: '24px',
  opacity: 0.75,
  padding: 0,
  position: 'absolute',
  right: 4,
  top: 4,
  width: 24
})

const HelpList = styled('div')<{listIndex: number}>(({listIndex}) => ({
  border: `1px solid ${PALETTE.SLATE_400}`,
  color: PALETTE.SLATE_700,
  fontSize: 13,
  lineHeight: '18px',
  margin: listIndex === 0 ? '0 auto' : '16px auto 0',
  minWidth: 0,
  textAlign: 'left'
}))

const HelpRow = styled('div')<{shortcutIndex: number}>(({shortcutIndex}) => ({
  alignItems: 'center',
  backgroundColor: shortcutIndex % 2 ? '#FFFFFF' : PALETTE.SLATE_200,
  display: 'flex',
  padding: '4px 0'
}))

const Icon = styled('div')({
  padding: '0 8px 0 16px',
  textAlign: 'center',
  width: 44
})

const Label = styled('div')({
  padding: '0 8px',
  width: 120
})

const Keyboard = styled('div')({
  padding: '0 8px',
  width: 192
})

const Markdown = styled('div')({
  padding: '0 8px',
  width: 192
})

const HeaderLabelBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: 1,
  width: '100%'
})

const HeaderLabel = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 13,
  fontWeight: 600,
  lineHeight: '18px',
  padding: '16px 8px 4px',
  textAlign: 'left',
  textTransform: 'uppercase',
  width: 192
})

const typeShortcuts = [
  {
    label: 'Bold',
    icon: 'format_bold',
    keyboard: `${modKey} + b`,
    md: '**bold** or __bold__'
  },
  {
    label: 'Italic',
    icon: 'format_italic',
    keyboard: `${modKey} + i`,
    md: '*italic* or _italic_'
  },
  {
    label: 'Underline',
    icon: 'format_underline',
    keyboard: `${modKey} + u`,
    md: ''
  },
  {
    label: 'Strikethrough',
    icon: 'format_strikethrough',
    keyboard: `${modKey} + shift + x`,
    md: '~text~ or ~~text~~'
  }
]
const mentionShortcuts = [
  {
    label: 'Links',
    icon: 'link',
    keyboard: `${modKey} + k`,
    md: '[linked text](url)'
  },
  {
    label: 'Tags',
    icon: 'label',
    keyboard: 'press ‘#’',
    md: ''
  },
  {
    label: 'Emoji',
    icon: 'sentiment_satisfied',
    keyboard: 'press ‘:’',
    md: ''
  },
  {
    label: 'Mentions',
    icon: 'person_pin',
    keyboard: 'press ‘@’',
    md: ''
  }
]
const blockShortcuts = [
  {
    label: 'Inline code',
    icon: 'code',
    keyboard: '',
    md: '`code`'
  },
  {
    label: 'Code block',
    icon: 'web_asset',
    keyboard: '',
    md: (
      <span>
        {'```'}
        <br />
        {'code'}
        <br />
        {'```'}
      </span>
    )
  },
  {
    label: 'Quotes',
    icon: 'format_quote',
    keyboard: '',
    md: '>quote'
  }
]
const shortcutLists = [typeShortcuts, mentionShortcuts, blockShortcuts]

const ModalBoundary = styled('div')({
  background: '#FFFFFF',
  borderRadius: Radius.DIALOG,
  display: 'flex',
  flexDirection: 'column',
  height: 480,
  width: 564
})

interface Props {
  handleCloseModal: () => void
}

const EditorHelpModal = (props: Props) => {
  const {handleCloseModal} = props
  return (
    <ModalBoundary>
      <ModalHeader>
        <ModalHeaderIcon>
          <IconLabel icon='keyboard' iconLarge />
        </ModalHeaderIcon>
        <ModalHeaderTitle>{'Task Card Formatting'}</ModalHeaderTitle>
        <CloseButton icon='close' iconLarge onClick={handleCloseModal} palette='midGray' />
      </ModalHeader>
      <HeaderLabelBlock>
        <HeaderLabel>{'Keyboard'}</HeaderLabel>
        <HeaderLabel>{'Markdown'}</HeaderLabel>
      </HeaderLabelBlock>
      {shortcutLists.map((shortcutList, listIndex) => {
        return (
          <HelpList listIndex={listIndex} key={`shortcutList${listIndex + 1}`}>
            {shortcutList.map((shortcut, shortcutIndex) => {
              return (
                <HelpRow shortcutIndex={shortcutIndex} key={`${shortcutList}${shortcutIndex + 1}`}>
                  <Icon>
                    <IconLabel icon={shortcut.icon} />
                  </Icon>
                  <Label>
                    <b>{shortcut.label}</b>
                  </Label>
                  <Keyboard>
                    <code>{shortcut.keyboard}</code>
                  </Keyboard>
                  <Markdown>
                    <code>{shortcut.md}</code>
                  </Markdown>
                </HelpRow>
              )
            })}
          </HelpList>
        )
      })}
    </ModalBoundary>
  )
}

export default EditorHelpModal
