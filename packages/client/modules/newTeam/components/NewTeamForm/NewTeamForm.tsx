import {NewTeamForm_organizations} from '../../../../__generated__/NewTeamForm_organizations.graphql'
import React, {useState, ChangeEvent, FormEvent} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Radio from '../../../../components/Radio/Radio'
import NewTeamOrgPicker from '../../../team/components/NewTeamOrgPicker'
import AddOrgMutation from '../../../../mutations/AddOrgMutation'
import AddTeamMutation from '../../../../mutations/AddTeamMutation'
import Legitity from '../../../../validation/Legitity'
import teamNameValidation from '../../../../validation/teamNameValidation'
import NewTeamFormBlock from './NewTeamFormBlock'
import NewTeamFormOrgName from './NewTeamFormOrgName'
import NewTeamFormTeamName from './NewTeamFormTeamName'
import StyledError from '../../../../components/StyledError'
import DashHeaderTitle from '../../../../components/DashHeaderTitle'
import linkify from '../../../../utils/linkify'
import useMutationProps from '../../../../hooks/useMutationProps'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useRouter from '../../../../hooks/useRouter'
import useForm from '../../../../hooks/useForm'

const StyledForm = styled('form')({
  margin: 0,
  maxWidth: '40rem',
  padding: 16,
  width: '100%'
})

const StyledPanel = styled(Panel)({
  margin: '16px 0'
})

const Header = styled('div')({
  alignItems: 'center',
  display: 'flex',
  height: 24,
  margin: '0 0 16px',
  width: '100%'
})

const FormHeading = styled(DashHeaderTitle)({
  margin: 0,
  padding: 0,
  width: '100%'
})

const FormInner = styled('div')({
  padding: '2rem'
})

export const NewTeamFieldBlock = styled('div')({
  width: '16rem'
})

const StyledButton = styled(PrimaryButton)({
  margin: '0 auto',
  width: '16rem'
})

const controlSize = 'medium'

interface Props {
  isInitiallyNewOrg: boolean
  organizations: NewTeamForm_organizations
}

const NewTeamForm = (props: Props) => {
  const {isInitiallyNewOrg, organizations} = props
  const [isNewOrg, setIsNewOrg] = useState(isInitiallyNewOrg)
  const [orgId, setOrgId] = useState('')

  const validateOrgName = (orgName: string) => {
    return new Legitity(orgName)
      .trim()
      .required('Your new org needs a name!')
      .min(2, 'C’mon, you call that an organization?')
      .max(100, 'Maybe just the legal name?')
      .test((val) => (linkify.match(val) ? 'Try using a name, not a link!' : undefined))
  }

  const validateTeamName = (teamName: string) => {
    let teamNames: string[] = []
    if (!isNewOrg) {
      const org = organizations.find((org) => org.id === orgId)
      if (org) {
        teamNames = org.teams.map((team) => team.name)
      }
    }
    return teamNameValidation(teamName, teamNames)
  }

  const {fields, onChange, validateField} = useForm({
    orgName: {
      getDefault: () => '',
      validate: validateOrgName
    },
    teamName: {
      getDefault: () => '',
      validate: validateTeamName
    }
  })

  const {submitting, onError, error, onCompleted, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()

  const updateOrgId = (orgId: string) => {
    setOrgId(orgId)
  }

  const handleIsNewOrgChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isNewOrg = e.target.value === 'true'
    setIsNewOrg(isNewOrg)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const {error: teamErr, value: teamName} = validateField('teamName')
    if (teamErr) return
    if (isNewOrg) {
      const {error: orgErr, value: orgName} = validateField('orgName')
      if (orgErr) return
      const newTeam = {
        name: teamName
      }
      const variables = {newTeam, orgName}
      submitMutation()
      AddOrgMutation(atmosphere, variables, {history, onError, onCompleted})
    } else {
      const newTeam = {
        name: teamName,
        orgId
      }
      submitMutation()
      AddTeamMutation(atmosphere, {newTeam}, {onError, onCompleted, history})
    }
  }

  return (
    <StyledForm onSubmit={onSubmit}>
      <Header>
        <FormHeading>{'Create a New Team'}</FormHeading>
      </Header>
      <StyledPanel>
        <FormInner>
          <NewTeamFormBlock>
            <FieldLabel fieldSize={controlSize} indent label='Add Team to…' />
          </NewTeamFormBlock>
          <NewTeamFormBlock>
            <Radio
              checked={!isNewOrg}
              name='isNewOrganization'
              value='false'
              label='an existing organization:'
              onChange={handleIsNewOrgChange}
            />
            <NewTeamFieldBlock>
              <NewTeamOrgPicker
                disabled={isNewOrg}
                onChange={updateOrgId}
                organizations={organizations}
                orgId={orgId}
              />
            </NewTeamFieldBlock>
          </NewTeamFormBlock>
          <NewTeamFormOrgName
            isNewOrg={isNewOrg}
            onChange={onChange}
            onTypeChange={handleIsNewOrgChange}
            orgName={fields.orgName.value}
            error={fields.orgName.error}
            placeholder='My new organization'
          />
          <NewTeamFormTeamName
            error={fields.teamName.error}
            onChange={onChange}
            teamName={fields.teamName.value}
          />

          <StyledButton size='large' waiting={submitting}>
            {isNewOrg ? 'Create Team & Org' : 'Create Team'}
          </StyledButton>
          {error && <StyledError>{error.message}</StyledError>}
        </FormInner>
      </StyledPanel>
    </StyledForm>
  )
}

export default createFragmentContainer(NewTeamForm, {
  organizations: graphql`
    fragment NewTeamForm_organizations on Organization @relay(plural: true) {
      ...NewTeamOrgPicker_organizations
      id
      teams {
        name
      }
    }
  `
})
