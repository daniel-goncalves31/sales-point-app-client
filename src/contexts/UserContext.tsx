import React, { useState, useContext, useEffect } from 'react'
import { useFetchApi } from '../hooks/use-fetch-api'
import { UserModel } from '../models/user/UserModel'
import { useUserListContext } from './UserListContext'

interface IUser {
  users: UserModel[]
  setUsers: React.Dispatch<React.SetStateAction<UserModel[]>>
  isLoading: boolean
}

const UserContext = React.createContext<IUser>({
  users: [],
  setUsers: () => { },
  isLoading: true
})

const useUserContext = () => useContext(UserContext)

const UserProvider: React.FC = ({ children }) => {
  const { setUserList } = useUserListContext()
  const [users, setUsers] = useState<UserModel[]>([])
  const { isLoading, data } = useFetchApi('/users')

  useEffect(() => {
    if (data) {
      setUsers(data)
    }
  }, [data])

  useEffect(() => {
    if (users) {
      const userList = users.map(user => ({ id: user.id, name: user.name }))
      setUserList(userList)
    }
  }, [users, setUserList])

  return (
    <UserContext.Provider
      value={{ users, isLoading, setUsers }}
    >
      {children}
    </UserContext.Provider>
  )
}

export { useUserContext, UserProvider }
