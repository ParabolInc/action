import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '~/components/Icon'
import PlainButton from '~/components/PlainButton/PlainButton'
import TierTag from '~/components/Tag/TierTag'
import useRouter from '~/hooks/useRouter'
import {TierLabel} from '~/types/constEnums'
import WaveWhiteSVG from 'static/images/waveWhite.svg'
import {APP_BAR_HEIGHT} from '../../styles/appbars'
import {PALETTE} from '../../styles/paletteV3'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import {StandardHub_viewer, TierEnum} from '../../__generated__/StandardHub_viewer.graphql'
import Avatar from '../Avatar/Avatar'

const StandardHubRoot = styled('div')({
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100%',
  backgroundPositionY: '101%',
  backgroundPositionX: '0',
  backgroundImage: `url('${WaveWhiteSVG}'), linear-gradient(90deg, ${PALETTE.GRAPE_700} 0%, ${PALETTE.SLATE_700} 100%)`,
  display: 'flex',
  flexDirection: 'column',
  minHeight: APP_BAR_HEIGHT,
  padding: 16,
  width: '100%'
})

const User = styled('div')({
  display: 'flex',
  cursor: 'pointer',
  flex: 1,
  position: 'relative'
})

const StyledAvatar = styled(Avatar)({
  cursor: 'pointer'
})

const NameAndEmail = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  paddingLeft: 16
})

const PreferredName = styled('div')({
  color: PALETTE.SLATE_200,
  fontSize: 16,
  lineHeight: '24px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

const Email = styled('div')({
  fontSize: 12,
  lineHeight: '16px'
})

const Upgrade = styled(PlainButton)({
  background: 'transparent',
  color: PALETTE.GOLD_300,
  display: 'flex',
  fontWeight: 600,
  paddingTop: 16,
  paddingBottom: 16
})

const UpgradeCTA = styled('span')({
  fontSize: 14,
  lineHeight: '24px',
  paddingLeft: 16
})

const Tier = styled(TierTag)({
  marginLeft: 64,
  marginBottom: 16,
  padding: '0 16px',
  width: 'fit-content'
})

interface Props {
  handleMenuClick: () => void
  viewer: StandardHub_viewer | null
}

const DEFAULT_VIEWER = {
  picture: '',
  preferredName: '',
  email: '',
  tier: 'personal'
} as const

const StandardHub = (props: Props) => {
  const {handleMenuClick, viewer} = props
  const {email, picture, preferredName, tier} = viewer || DEFAULT_VIEWER
  const userAvatar = picture || defaultUserAvatar
  const {history} = useRouter()
  const handleUpgradeClick = () => {
    history.push(`/me/organizations`)
    handleMenuClick()
  }
  const gotoUserSettings = () => {
    history.push('/me/profile')
    handleMenuClick()
  }
  return (
    <StandardHubRoot>
      <User onClick={gotoUserSettings}>
        <StyledAvatar hasBadge={false} picture={userAvatar} size={48} />
        <NameAndEmail>
          <PreferredName>{preferredName}</PreferredName>
          <Email>{email}</Email>
        </NameAndEmail>
      </User>
      {tier === 'personal' ? (
        <Upgrade onClick={handleUpgradeClick}>
          <Icon>verified_user</Icon>
          <UpgradeCTA>
            {'Upgrade to '}
            <b>{TierLabel.PRO}</b>
          </UpgradeCTA>
        </Upgrade>
      ) : (
        <Tier tier={tier as TierEnum} />
      )}
    </StandardHubRoot>
  )
}

export default createFragmentContainer(StandardHub, {
  viewer: graphql`
    fragment StandardHub_viewer on User {
      email
      picture
      preferredName
      tier
    }
  `
})
