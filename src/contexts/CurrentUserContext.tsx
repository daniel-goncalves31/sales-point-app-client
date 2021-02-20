import React, { useState, useContext, useEffect } from 'react'
import { useFetchApi } from '../hooks/use-fetch-api'
import { UserModel } from '../models/user/UserModel'
import { Spin } from 'antd'

interface IUser {
  currentUser: UserModel | null
  setCurrentUser: React.Dispatch<React.SetStateAction<UserModel | null>>
  isAuthenticated: boolean
  isAuthorized: (permissions: string[]) => boolean
}

const CurrentUserContext = React.createContext<IUser>({
  isAuthenticated: false,
  isAuthorized: () => false,
  setCurrentUser: () => { },
  currentUser: null
})

const useCurrentUserContext = () => useContext(CurrentUserContext)

const CurrentUserProvider: React.FC = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null)
  const { isLoading, data } = useFetchApi('/me')

  useEffect(() => {
    if (data) {
      setCurrentUser(data)
    }
  }, [data])

  const isAuthorized = (permissions: string[]) =>
    permissions.some(permission => permission === currentUser?.role)

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated: !!currentUser,
        isAuthorized
      }}
    >
      <Spin
        spinning={isLoading}
        tip='Carregando...'
        size='large'
        delay={500}
        style={{ fontSize: '16px', fontWeight: 'bold' }}
        wrapperClassName='login-loading-container'
      >
        {children}
      </Spin>
    </CurrentUserContext.Provider>
  )
}

export { useCurrentUserContext, CurrentUserProvider }
