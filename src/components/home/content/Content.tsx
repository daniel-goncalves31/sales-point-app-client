import './content.styles.less'

import { Redirect, Route, Switch } from 'react-router-dom'

import AuthorizedRoute from '../../global/AuthorizedRoute'
import { Layout } from 'antd'
import { ProductProvider } from '../../../contexts/ProductContext'
import Products from './products/Products'
import { PurchaseProvider } from '../../../contexts/PurchaseContext'
import Purchases from './purchases/Purchases'
import React from 'react'
import { SaleProvider } from '../../../contexts/SaleContext'
import Sales from './sales/Sales'
import { ServiceProvider } from '../../../contexts/ServiceContext'
import Services from './services/Services'
import { UserListProvider } from '../../../contexts/UserListContext'
import { UserProvider } from '../../../contexts/UserContext'
import Users from './users/Users'

interface Props { }

const LayoutContent: React.FC<Props> = () => {
  return (
    <Layout.Content className='content-container'>
      <ProductProvider>
        <ServiceProvider>
          <SaleProvider>
            <PurchaseProvider>
              <UserListProvider>
                <UserProvider	>
                  <Switch>
                    <Route path='/sales' component={Sales} />
                    <AuthorizedRoute
                      path='/purchases'
                      component={Purchases}
                      permissions={['Admin', 'Admin Master']}
                    />
                    <AuthorizedRoute
                      path='/products'
                      component={Products}
                      permissions={['Admin', 'Admin Master']}
                    />
                    <Route
                      path='/services'
                      component={Services}
                    />
                    <AuthorizedRoute
                      path='/users'
                      component={Users}
                      permissions={['Admin Master']}
                    />
                    <Redirect from='/' to='/sales' />
                  </Switch>
                </UserProvider>
              </UserListProvider>
            </PurchaseProvider>
          </SaleProvider>
        </ServiceProvider>
      </ProductProvider>
    </Layout.Content>
  )
}

export default LayoutContent
