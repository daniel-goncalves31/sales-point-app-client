import React from 'react'
import { Switch, BrowserRouter } from 'react-router-dom'
import Login from './components/login/Login'
import PrivateRoute from './components/global/PrivateRoute'
import Home from './components/home/Home'
import PublicRoute from './components/global/PublicRoute'

interface Props {}

const Routes: React.FC<Props> = () => {
  return (
    <BrowserRouter>
      <Switch>
        <PublicRoute path='/login' component={Login} />
        <PrivateRoute path='/' component={Home} />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes
