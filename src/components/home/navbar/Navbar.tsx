import './navbar.styles.css'

import { Menu, Typography } from 'antd'

import { LogoutOutlined } from '@ant-design/icons'
import React from 'react'
import logo from '../../../assets/images/logo.png'
import { useCurrentUserContext } from '../../../contexts/CurrentUserContext'
import { useFetchLazyApi } from '../../../hooks/use-fetch-lazy-api'

interface Props { }

const Navbar: React.FC<Props> = () => {
  const { fetchLazyApi } = useFetchLazyApi()
  const { currentUser, setCurrentUser } = useCurrentUserContext()
  const handleLogOut = async () => {
    await fetchLazyApi('/logout')
    setCurrentUser(null)
  }

  return (
    <nav>
      <img src={logo} alt='logo' className='logo' />
      <div className='div-user-name'>
        <span>Bem Vindo, </span>
        <Typography.Title level={4}>{currentUser?.name}</Typography.Title>
      </div>
      <Menu mode='horizontal' className='menu'>
        <Menu.Item key='mail' icon={<LogoutOutlined />} onClick={handleLogOut}>
          Sair
        </Menu.Item>
      </Menu>
    </nav>
  )
}

export default Navbar
