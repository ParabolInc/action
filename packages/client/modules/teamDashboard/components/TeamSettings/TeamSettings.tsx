import {TeamSettings_viewer} from '../../../../__generated__/TeamSettings_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps} from 'react-router-dom'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Row from '../../../../components/Row/Row'
import {WithAtmosphereProps} from '../../../../decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from '../../../../styles/paletteV3'
import {Layout, TierLabel} from '../../../../types/constEnums'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import useRouter from '../../../../hooks/useRouter'
import ArchiveTeam from '../ArchiveTeam/ArchiveTeam'

const TeamSettingsLayout = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%'
})

const PanelsLayout = styled('div')({
  margin: '0 auto',
  maxWidth: Layout.SETTINGS_MAX_WIDTH,
  width: '100%'
})

const PanelRow = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER
})

const StyledRow = styled(Row)({
  borderTop: 0
})

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  viewer: TeamSettings_viewer
}

const TeamSettings = (props: Props) => {
  const {viewer} = props
  const {history} = useRouter()
  const {team} = viewer
  const {name: teamName, orgId, teamMembers, tier} = team!
  useDocumentTitle(`Team Settings | ${teamName}`, 'Team Settings')
  const viewerTeamMember = teamMembers.find((m) => m.isSelf)
  // if kicked out, the component might reload before the redirect occurs
  if (!viewerTeamMember) return null
  const {isLead: viewerIsLead} = viewerTeamMember
  return (
    <TeamSettingsLayout>
      <PanelsLayout>
        {tier === 'personal' && (
          <Panel>
            <StyledRow>
              <div>{'This team is currently on a personal plan.'}</div>
              <PrimaryButton onClick={() => history.push(`/me/organizations/${orgId}`)}>
                {`Upgrade Team to ${TierLabel.PRO}`}
              </PrimaryButton>
            </StyledRow>
          </Panel>
        )}
        {viewerIsLead && (
          <Panel label='Danger Zone'>
            <PanelRow>
              <ArchiveTeam team={team!} />
            </PanelRow>
          </Panel>
        )}
      </PanelsLayout>
    </TeamSettingsLayout>
  )
}

export default createFragmentContainer(TeamSettings, {
  viewer: graphql`
    fragment TeamSettings_viewer on User {
      team(teamId: $teamId) {
        ...ArchiveTeam_team
        isLead
        id
        name
        tier
        orgId
        teamMembers(sortBy: "preferredName") {
          teamMemberId: id
          userId
          isLead
          isSelf
          preferredName
        }
      }
    }
  `
})
