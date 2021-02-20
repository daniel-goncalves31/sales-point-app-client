import React, { useState, useContext, useEffect } from 'react'
import { useFetchLazyApi } from '../hooks/use-fetch-lazy-api'
import { UserList } from '../models/user/UserList'

interface IUserList {
  userList: UserList[] | null,
  setUserList: React.Dispatch<React.SetStateAction<UserList[] | null>>
}

const UserListContext = React.createContext<IUserList>({
  userList: null,
  setUserList: () => { }
})

const useUserListContext = () => useContext(UserListContext)

const UserListProvider: React.FC = ({ children }) => {
  const [userList, setUserList] = useState<UserList[] | null>(null)
  const { fetchLazyApi } = useFetchLazyApi('')

  const getUserList = async (): Promise<void> => {
    const data = await fetchLazyApi('/user')
    if (data) {
      setUserList(data)
    }
  }

  useEffect(() => {
    getUserList()
    // eslint-disable-next-line
  }, [])

  return (
    <UserListContext.Provider
      value={{
        userList,
        setUserList
      }}
    >
      {children}
    </UserListContext.Provider>
  )
}

export { useUserListContext, UserListProvider }
