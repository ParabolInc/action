/// <reference types="@types/segment-analytics" />

import * as Sentry from '@sentry/browser'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef} from 'react'
import {fetchQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {LocalStorageKey} from '~/types/constEnums'
import safeIdentify from '~/utils/safeIdentify'
import {AnalyticsPageQuery} from '~/__generated__/AnalyticsPageQuery.graphql'
import useScript from '../hooks/useScript'
import getAnonymousId from '../utils/getAnonymousId'
import makeHref from '../utils/makeHref'

const query = graphql`
  query AnalyticsPageQuery {
    viewer {
      email
    }
  }
`

declare global {
  interface Window {
    analytics: SegmentAnalytics.AnalyticsJS
  }
}

const dsn = window.__ACTION__.sentry

if (dsn) {
  Sentry.init({
    dsn,
    environment: 'client',
    release: __APP_VERSION__,
    ignoreErrors: [
      'Failed to update a ServiceWorker for scope',
      'ResizeObserver loop limit exceeded'
    ]
  })
}

// page titles are changed in child components via useDocumentTitle, which fires after this
// we must guarantee that this runs after useDocumentTitle
// we can't move this into useDocumentTitle since the pathname may change without chaging the title
const TIME_TO_RENDER_TREE = 100

const AnalyticsPage = () => {
  const key = window.__ACTION__.segment
  if (!key) return null // development use
  /* eslint-disable */
  const {href, pathname} = location
  const pathnameRef = useRef(pathname)
  useEffect(() => {
    if (!window.analytics) {
      // we dont use the segment snippet because we can guarantee no call will be made to segment before it's loaded
      // internally, segment will call an initial page event unless parseFloat(version, 10) !== 0
      // this knowledge comes from reading the minified analytics.js code
      const mockSnippet = [] as any
      mockSnippet.SNIPPET_VERSION = '4.1.0'
      window.analytics = mockSnippet
    }
  }, [])
  const [isSegmentLoaded] = useScript(`https://cdn.segment.com/analytics.js/v1/${key}/analytics.min.js`, {crossOrigin: true})
  const atmosphere = useAtmosphere()

  useEffect(() => {
    if (!isSegmentLoaded || !window.analytics) return
    const token = window.localStorage.getItem(LocalStorageKey.APP_TOKEN_KEY)
    // no token means authentication is required & authentication handles identify on its own
    if (!token) return
    const email = window.localStorage.getItem(LocalStorageKey.EMAIL)
    if (email) {
      safeIdentify(atmosphere.viewerId, email)
      return
    }
    const cacheEmail = async () => {
      const res = await fetchQuery<AnalyticsPageQuery>(atmosphere, query, {})
      const nextEmail = res?.viewer?.email
      if (!nextEmail) return
      window.localStorage.setItem(LocalStorageKey.EMAIL, nextEmail)
      safeIdentify(atmosphere.viewerId, nextEmail)
    }
    cacheEmail().catch()
  }, [isSegmentLoaded])

  useEffect(() => {
    if (!isSegmentLoaded || !window.analytics) return
    const prevPathname = pathnameRef.current
    pathnameRef.current = pathname
    setTimeout(() => {
      const title = document.title || ''
      // This is the magic. Ignore everything after hitting the pipe
      const [pageName] = title.split(' | ')
      window.analytics.page(pageName, {
        referrer: makeHref(prevPathname),
        title,
        path: pathname,
        url: href,
      },
        // See: segmentIo.ts:28 for more information on the next line
        {integrations: {'Google Analytics': {clientId: getAnonymousId()}}}
      )
    }, TIME_TO_RENDER_TREE)
  }, [isSegmentLoaded, pathname])
  return null
}

export default AnalyticsPage
