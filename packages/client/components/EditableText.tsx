import styled from '@emotion/styled'
import React, {forwardRef, useEffect, useRef, useState} from 'react'
import TextAreaAutoSize from 'react-textarea-autosize'
import {PALETTE} from '../styles/paletteV3'
import {FONT_FAMILY, ICON_SIZE} from '../styles/typographyV2'
import Legitity from '../validation/Legitity'
import Icon from './Icon'

const StaticBlock = styled('div')<{disabled: boolean | undefined}>(({disabled}) => ({
  alignItems: 'center',
  cursor: disabled ? 'default' : 'pointer',
  display: 'flex',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  outline: disabled ? 'none' : undefined,
  width: '100%',
  ':hover': {
    opacity: disabled ? undefined : 0.5
  }
}))

const Placeholder = styled('div')({
  color: PALETTE.SLATE_600
})

const StaticValue = styled('div')({
  color: PALETTE.SLATE_700
})

const Error = styled('div')({
  color: PALETTE.TOMATO_500,
  fontSize: 14
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD18,
  marginLeft: 8
})

const Input = styled('input')({
  backgroundColor: 'transparent',
  border: 0,
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  outline: 'none',
  padding: 0,
  width: 'auto'
})

const TextArea = styled(TextAreaAutoSize)({
  backgroundColor: 'transparent',
  border: 0,
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  outline: 'none',
  padding: 0,
  resize: 'none',
  width: '100%'
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

interface Props {
  autoFocus?: boolean
  className?: string
  disabled?: boolean
  error: string | undefined
  validate: (value: string) => Legitity
  handleSubmit: (value: string) => void
  hideIcon?: boolean
  isWrap?: boolean
  initialValue: string
  maxLength: number
  placeholder: string
  onEditingChange?: (isEditing: boolean) => void
}

const EditableText = forwardRef((props: Props, ref: any) => {
  const {initialValue, error, handleSubmit, maxLength, placeholder, validate, autoFocus: autoFocusProp, className, disabled, hideIcon, isWrap, onEditingChange} = props
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)
  const [value, setValue] = useState(initialValue)
  useEffect(() => {
    if (isEditing) return
    setValue(initialValue)
  }, [initialValue])

  const setEditing = (isEditing: boolean) => {
    setIsEditing(isEditing)
    setAutoFocus(false)
    onEditingChange?.(isEditing)
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = e.target.value || ''
    validate(nextValue)
    // make sure this is always true
    // repro: remove all text, blur input, focus input (with error present), then type a char
    setEditing(true)
    setValue(nextValue)
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (value.toLowerCase().startsWith(placeholder.toLowerCase())) {
      e.target.select()
    }
    if (isWrap) {
      // hack to move caret to end
      // because it's 2020 and we still have to do stupid hacks like this >:-(
      const tmp = e.target.value
      e.target.value = ''
      e.target.value = tmp
    }
  }

  const onSubmit = async (e: React.FocusEvent | React.FormEvent) => {
    e.preventDefault()
    setEditing(false)
    if (value.trim() === initialValue.trim()) return
    handleSubmit(value)
  }

  const reset = () => {
    setEditing(false)
    setValue(initialValue)
    validate(initialValue)
    inputRef.current?.blur()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // wait a tick so other escape listeners see that this is the active element
      setTimeout(reset)
    }
  }

  const showEditing = (error || isEditing || autoFocus) && !disabled
  if (showEditing) {
    const inProps = {
      autoFocus: true,
      ref: inputRef as any,
      maxLength,
      onBlur: onSubmit,
      onChange: onChange,
      onFocus: onFocus,
      onKeyDown: onKeyDown,
      placeholder,
      value
    } as const
    return (
      <div className={className} ref={ref}>
        <Form onSubmit={onSubmit}>
          {isWrap ? <TextArea {...inProps} maxRows={3} /> : <Input {...inProps} />}
          {error && <Error>{error}</Error>}
        </Form>
      </div>
    )
  }
  const showPlaceholder = !value && placeholder
  return (
    <div className={className} ref={ref}>
      <StaticBlock
        disabled={disabled}
        tabIndex={0}
        onFocus={() => setEditing(true)}
        onClick={() => setEditing(true)}
      >
        {showPlaceholder && <Placeholder>{placeholder}</Placeholder>}
        {value && <StaticValue>{value}</StaticValue>}
        {!hideIcon && !disabled && <StyledIcon>edit</StyledIcon>}
      </StaticBlock>
    </div>
  )
})
export default EditableText
