import styled from '@emotion/styled'
import React from 'react'
import useModal from '../hooks/useModal'
import {PALETTE} from '../styles/paletteV3'
import lazyPreload from '../utils/lazyPreload'
import IconLabel from './IconLabel'
import LinkButton from './LinkButton'

const DeleteAccountModal = lazyPreload(() =>
  import(/* webpackChunkName: 'DeleteAccountModal' */ './DeleteAccountModal')
)

const Hint = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 13,
  marginTop: 8
})

const DeleteAccount = () => {
  const {togglePortal, modalPortal} = useModal()
  return (
    <>
      <div>
        <LinkButton
          aria-label='Click to permanently delete your account.'
          palette='red'
          onClick={togglePortal}
        >
          <IconLabel icon='remove_circle' label='Delete Account' />
        </LinkButton>
        <Hint>
          <b>Note</b>: {'This can’t be undone.'}
        </Hint>
      </div>
      {modalPortal(<DeleteAccountModal />)}
    </>
  )
}

export default DeleteAccount
