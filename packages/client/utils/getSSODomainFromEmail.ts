const getSSODomainFromEmail = (email: string) => {
  const [, domainWithTld] = email.toLowerCase().split('@')
  if (!domainWithTld) return null
  return domainWithTld
}

export default getSSODomainFromEmail
