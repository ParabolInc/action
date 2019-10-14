const makeSuggestedIntegrationId = (item) => {
  const {service} = item
  switch (service) {
    case 'github':
      return item.nameWithOwner
    case 'jira':
      return `${item.cloudId}:${item.projectKey}`
    case 'azuredevops':
        return `${item.organization}:${item.projectKey}`
    }
}

export default makeSuggestedIntegrationId
