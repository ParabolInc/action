interface Options {
  searchParams?: {
    utm_source: string
    utm_medium: string
    utm_campaign: string
  }
}

const makeAppURL = (origin: string, pathname: string, options?: Options) => {
  const searchParams = options?.searchParams ?? {} as Record<string, string>
  const url = new URL(origin)
  url.pathname = pathname
  Object.entries(searchParams).forEach((entry) => {
    url.searchParams.append(...entry)
  })
  return url.toString()
}

export default makeAppURL
