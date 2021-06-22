import React, {useCallback, useMemo, useReducer} from 'react'
import Legitity from '../validation/Legitity'
import useEventCallback from './useEventCallback'

interface FieldInputDict {
  [name: string]: {
    getDefault(): any
    validate?(rawInput: any): Legitity
    normalize?(rawInput: any, previousValue: any): any
  }
}

export interface UseFormField {
  value: string
  error: string | undefined
  dirty: boolean
  resetValue: (value?: string) => void
  setError: (error: string) => void
}

interface FieldState {
  [name: string]: UseFormField
}

interface SetError {
  type: 'setError'
  name: string
  error: string | undefined
}

interface SetDirty {
  type: 'setDirty'
  name: string
}

interface SetValue {
  type: 'setValue'
  name: string
  value: string
}

type FormAction = SetError | SetDirty | SetValue

const reducer = (state: FieldState, action: FormAction) => {
  switch (action.type) {
    case 'setDirty':
      if (state[action.name].dirty) return state
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          dirty: true
        }
      }
    case 'setError':
      if (state[action.name].error === action.error) return state
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          error: action.error
        }
      }
    case 'setValue':
      if (state[action.name].value === action.value) return state
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          value: action.value
        }
      }
  }
}

const useForm = (fieldInputDict: FieldInputDict, deps: any[] = []) => {
  const [state, dispatch] = useReducer(
    reducer,
    useMemo(
      () =>
        Object.keys(fieldInputDict).reduce((obj, name) => {
          obj[name] = {
            value: fieldInputDict[name].getDefault(),
            error: undefined,
            dirty: false,
            resetValue: (value = '') => {
              dispatch({type: 'setValue', name, value})
            },
            setError: (error: string) => {
              dispatch({type: 'setError', name, error})
            }
          }
          return obj
        }, {} as FieldState),
      [
        /* eslint-disable-line react-hooks/exhaustive-deps */
      ]
    )
  )

  const normalize = useCallback(
    (name: string, value: any) => {
      const normalizeField = fieldInputDict[name].normalize
      const prevValue = state[name].value
      return normalizeField ? normalizeField(value, prevValue) : value
    },
    [...deps, state]
  )

  const validate = useEventCallback((name: string, value: any) => {
    const validateField = fieldInputDict[name].validate
    if (!validateField) return {error: undefined, value}
    const res: Legitity = validateField(value)
    dispatch({type: 'setError', name, error: res.error})
    return res
  })

  const validateField = useEventCallback((name?: string) => {
    if (!name) {
      return Object.keys(state).reduce((obj, name) => {
        obj[name] = validateField(name)
        return obj
      }, {})
    }
    return validate(name, state[name].value)
  })

  const setDirty = useEventCallback((name?: string) => {
    if (!name) {
      Object.keys(state).forEach((name) => setDirty(name))
      return
    }
    dispatch({type: 'setDirty', name})
  })

  const onChange = useEventCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    const name = e.target.name
    const normalizedValue = normalize(name, value)
    dispatch({type: 'setValue', name, value: normalizedValue})
    validate(name, normalizedValue)
  })

  return {setDirtyField: setDirty, onChange, validateField, fields: state}
}

export default useForm
