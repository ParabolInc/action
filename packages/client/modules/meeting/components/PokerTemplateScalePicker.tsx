import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '../../../components/Icon'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import useTooltip from '../../../hooks/useTooltip'
import textOverflow from '../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../styles/paletteV3'
import {FONT_FAMILY, ICON_SIZE} from '../../../styles/typographyV2'
import lazyPreload from '../../../utils/lazyPreload'
import {PokerTemplateScalePicker_dimension} from '../../../__generated__/PokerTemplateScalePicker_dimension.graphql'

const SelectScaleDropdown = lazyPreload(() =>
  import(
    /* webpackChunkName: 'SelectScaleDropdown' */
    './SelectScaleDropdown'
  )
)

const DropdownIcon = styled(Icon)({
  color: PALETTE.SLATE_700,
  marginTop: 7,
  marginBottom: 5,
  marginRight: 16,
  fontSize: ICON_SIZE.MD18
})

const DropdownBlock = styled('div')<{disabled: boolean}>(({disabled}) => ({
  background: disabled ? PALETTE.SLATE_200 : '#fff',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: '30px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  fontSize: 13,
  lineHeight: '20px',
  minWidth: 144,
  userSelect: 'none'
}))

const MenuToggleInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  minWidth: 0,
  marginLeft: 16
})

const MenuToggleLabel = styled('div')({
  ...textOverflow,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  lineHeight: '20px',
  textAlign: 'center',
  margin: 'auto'
})

interface Props {
  dimension: PokerTemplateScalePicker_dimension
  isOwner: boolean
}

const PokerTemplateScalePicker = (props: Props) => {
  const {dimension, isOwner} = props
  const {selectedScale} = dimension
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_RIGHT,
    {
      isDropdown: true,
      id: 'scaleDropdown',
      parentId: 'templateModal',
      loadingWidth: 300
    }
  )
  const {openTooltip, tooltipPortal, closeTooltip, originRef: tooltipRef} = useTooltip<
    HTMLDivElement
  >(MenuPosition.LOWER_CENTER, {
    disabled: isOwner
  })
  return (
    <>
      <DropdownBlock
        onMouseEnter={SelectScaleDropdown.preload}
        onClick={isOwner ? togglePortal : undefined}
        disabled={!isOwner}
        ref={isOwner ? originRef : tooltipRef}
        onMouseOver={openTooltip}
        onMouseLeave={closeTooltip}
      >
        <MenuToggleInner>
          <MenuToggleLabel>{selectedScale.name}</MenuToggleLabel>
        </MenuToggleInner>
        <DropdownIcon>expand_more</DropdownIcon>
      </DropdownBlock>
      {menuPortal(<SelectScaleDropdown menuProps={menuProps} dimension={dimension} />)}
      {tooltipPortal(<div>Must be the template owner to change</div>)}
    </>
  )
}
export default createFragmentContainer(PokerTemplateScalePicker, {
  dimension: graphql`
    fragment PokerTemplateScalePicker_dimension on TemplateDimension {
      ...SelectScaleDropdown_dimension
      id
      selectedScale {
        name
      }
    }
  `
})
