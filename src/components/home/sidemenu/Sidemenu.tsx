import './sidemenu.styles.less'

import {
  DatabaseOutlined,
  DollarOutlined,
  InteractionOutlined,
  ToolOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Layout, Menu } from 'antd'

import { NavLink } from 'react-router-dom'
import React from 'react'
import { useCurrentUserContext } from '../../../contexts/CurrentUserContext'

interface Props { }

const Sidemenu: React.FC<Props> = () => {
  const { isAuthorized } = useCurrentUserContext()

  return (
    <Layout.Sider
      breakpoint='md'
      collapsible
      style={{ backgroundColor: '#fcfcfc', borderRight: '1px solid #ddd' }}
    >
      <Menu
        theme='light'
        mode='inline'
        defaultSelectedKeys={['sales']}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item icon={<DollarOutlined />} key='sales'>
          <NavLink to='/sales'>Vendas</NavLink>
        </Menu.Item>
        {isAuthorized(['Admin', 'Admin Master']) && (
          <Menu.Item icon={<InteractionOutlined />} key='purchases'>
            <NavLink to='/purchases'>Repor Estoque</NavLink>
          </Menu.Item>
        )}
        {isAuthorized(['Admin', 'Admin Master']) && (
          <Menu.Item icon={<DatabaseOutlined />} key='products'>
            <NavLink to='/products'>Produtos á Cadastrar</NavLink>
          </Menu.Item>
        )}
        <Menu.Item icon={<ToolOutlined />} key='services'>
          <NavLink to='/services'>Assisências Técnicas</NavLink>
        </Menu.Item>
        {isAuthorized(['Admin Master']) && (
          <Menu.Item icon={<UserOutlined />} key='users'>
            <NavLink to='/users'>Gerenciar Usuários</NavLink>
          </Menu.Item>
        )}
      </Menu>
    </Layout.Sider>
  )
}

export default Sidemenu
