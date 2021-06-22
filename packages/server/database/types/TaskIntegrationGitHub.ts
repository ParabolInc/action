import TaskIntegration from '../../graphql/types/TaskIntegration'

interface Input {
  nameWithOwner: string
  issueNumber: string
}

export default class TaskIntegrationGitHub extends TaskIntegration {
  nameWithOwner: string
  issueNumber: string
  constructor(input: Input) {
    const {nameWithOwner, issueNumber} = input
    super({service: 'github'})
    this.nameWithOwner = nameWithOwner
    this.issueNumber = issueNumber
  }
}
