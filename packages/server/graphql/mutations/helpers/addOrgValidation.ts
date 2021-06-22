import legitify from 'parabol-client/validation/legitify'
import {orgName, teamName} from 'parabol-client/validation/templates'

export default function addOrgValidation() {
  return legitify({
    newTeam: {
      name: teamName
    },
    orgName
  })
}
