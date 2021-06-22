import generateUID from '../../generateUID'

interface Input {
  id: string
  domains: string[]
  url: string
  metadata: string
}

export default class SAML {
  id: string
  domains: string[]
  url: string
  metadata: string

  constructor(input: Input) {
    const {id, domains, url, metadata} = input
    this.id = id || generateUID()
    this.domains = domains
    this.url = url
    this.metadata = metadata
  }
}
