import {useEffect, useState} from 'react'

const useIsInitializing = (timeout = 0) => {
  const [isInitializing, setIsInitializing] = useState(true)
  useEffect(() => {
    setTimeout(() => {
      setIsInitializing(false)
    }, timeout)
  }, [])
  return isInitializing
}

export default useIsInitializing
