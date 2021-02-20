import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useCurrentUserContext } from '../../contexts/CurrentUserContext'

interface Props {
  exact?: boolean
  path: string
  component: any
}

const PublicRoute: React.FC<Props> = ({
  exact,
  path,
  component: Component
}) => {
  const { isAuthenticated } = useCurrentUserContext()

  return (
    <Route
      exact={!!exact}
      path={path}
      render={props =>
        !isAuthenticated ? <Component {...props} /> : <Redirect to='/' />
      }
    />
  )
}

export default PublicRoute
