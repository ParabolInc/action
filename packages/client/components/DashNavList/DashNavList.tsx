import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, Fragment} from 'react'
import {createFragmentContainer} from 'react-relay'
import {DashNavList_viewer} from '../../__generated__/DashNavList_viewer.graphql'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'

const DashNavListStyles = styled('div')({
  paddingRight: 8,
  width: '100%'
})

const OrgName = styled('div')({
  paddingTop: 8,
  paddingLeft: 8,
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '24px',
  color: PALETTE.SLATE_500,
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    paddingLeft: 16
  }
})

const EmptyTeams = styled('div')({
  fontSize: 16,
  fontStyle: 'italic',
  padding: 16,
  textAlign: 'center'
})

const DashHR = styled('div')({
  borderBottom: `1px solid ${PALETTE.SLATE_300}`,
  width: 'calc(100% + 8px)'
})

interface Props {
  className?: string
  viewer: DashNavList_viewer | null
  onClick?: () => void
}

const DashNavList = (props: Props) => {
  const {className, onClick, viewer} = props
  const teams = viewer?.teams

  const teamsByOrgKey = useMemo(() => {
    if (!teams) return null
    const teamsByOrgId = {} as {[key: string]: DashNavList_viewer['teams'][0][]}
    teams.forEach((team) => {
      const {organization} = team
      const {id: orgId, name: orgName} = organization
      const key = `${orgName}:${orgId}`
      teamsByOrgId[key] = teamsByOrgId[key] || []
      teamsByOrgId[key].push(team)
    })
    return Object.entries(teamsByOrgId).sort((a, b) =>
      a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1
    )
  }, [teams])
  if (!teams || !teamsByOrgKey) return null

  if (teams.length === 0) {
    return <EmptyTeams>It appears you are not a member of any team!</EmptyTeams>
  }

  // const team = Object.values(teamsByOrgKey)
  const isSingleOrg = teamsByOrgKey.length === 1
  return (
    <DashNavListStyles>
      {isSingleOrg
        ? teams.map((team) => (
          <LeftDashNavItem
            className={className}
            onClick={onClick}
            key={team.id}
            icon={team.isPaid ? 'group' : 'warning'}
            href={`/team/${team.id}`}
            label={team.name}
          />
        ))
        : teamsByOrgKey.map((entry, idx) => {
          const [key, teams] = entry
          const name = key.slice(0, key.lastIndexOf(':'))
          return (
            <Fragment key={key}>
              <OrgName>{name}</OrgName>
              {teams.map((team) => (
                <LeftDashNavItem
                  className={className}
                  onClick={onClick}
                  key={team.id}
                  icon={team.isPaid ? 'group' : 'warning'}
                  href={`/team/${team.id}`}
                  label={team.name}
                />
              ))}
              {idx !== teamsByOrgKey.length - 1 && <DashHR />}
            </Fragment>
          )
        })}
    </DashNavListStyles>
  )
}

graphql`
  fragment DashNavListTeam on Team {
    id
    isPaid
    name
    organization {
      id
      name
    }
  }
`
export default createFragmentContainer(DashNavList, {
  viewer: graphql`
    fragment DashNavList_viewer on User {
      teams {
        ...DashNavListTeam @relay(mask: false)
      }
    }
  `
})
