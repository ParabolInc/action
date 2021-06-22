import GraphiQL from 'graphiql'
import {ToolbarSelect, ToolbarSelectOption} from 'graphiql/dist/components/ToolbarSelect'
import 'graphiql/graphiql.css'
import React, {useRef, useState} from 'react'
import styled from '@emotion/styled'
import logoMarkPrimary from '../../../../styles/theme/images/brand/lockup_color_mark_dark_type.svg'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from '../../../../hooks/useAuthRoute'
import {AuthTokenRole, LocalStorageKey} from '../../../../types/constEnums'
import {Fetcher} from 'graphiql/dist/components/GraphiQL'

const GQL = styled('div')({
  margin: 0,
  height: '100vh',
  minHeight: '100vh',
  padding: 0,
  width: '100%'
})

type SchemaType = 'Public' | 'Private'

const GraphqlContainer = () => {
  const [currentSchema, setCurrentSchema] = useState<SchemaType>(() => {
    return (window.localStorage.getItem(LocalStorageKey.GRAPHIQL_SCHEMA) as SchemaType) || 'Public'
  })

  const graphiql = useRef<GraphiQL>(null)
  const atmosphere = useAtmosphere()
  useAuthRoute({role: AuthTokenRole.SUPER_USER})
  const changeSchema = (value: SchemaType) => () => {
    setCurrentSchema(value)
    window.localStorage.setItem(LocalStorageKey.GRAPHIQL_SCHEMA, value)
  }
  const fetcher: Fetcher = async ({query, variables}) => {
    const res = await fetch('/intranet-graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${atmosphere.authToken}`
      },
      body: JSON.stringify({query, variables, isPrivate: currentSchema === 'Private'})
    })
    return res.json()
  }

  return (
    <GQL>
      <GraphiQL fetcher={fetcher} ref={graphiql}>
        <GraphiQL.Logo>
          <img crossOrigin='' alt='Parabol' src={logoMarkPrimary} />
        </GraphiQL.Logo>
        <GraphiQL.Toolbar>
          <GraphiQL.ToolbarButton
            onClick={() => graphiql.current!.handlePrettifyQuery()}
            title='Prettify Query (Shift-Ctrl-P)'
            label='Prettify'
          />
          <GraphiQL.ToolbarButton
            onClick={() => graphiql.current!.handleToggleHistory()}
            title='Show History'
            label='History'
          />
          <GraphiQL.Group>
            <span>Schema: </span>
            <ToolbarSelect title='Schema' label='Schema' >
              <ToolbarSelectOption
                label='Public'
                value='Public'
                selected={currentSchema === 'Public'}
                onSelect={changeSchema('Public')}
              />
              <ToolbarSelectOption
                label='Private'
                value='Private'
                selected={currentSchema === 'Private'}
                onSelect={changeSchema('Private')}
              />
            </ToolbarSelect>
          </GraphiQL.Group>
        </GraphiQL.Toolbar>
      </GraphiQL>
    </GQL>
  )
}

export default GraphqlContainer
