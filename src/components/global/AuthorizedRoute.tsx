import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useCurrentUserContext } from '../../contexts/CurrentUserContext'

interface Props {
  exact?: boolean
  path: string
  component: any
  permissions: string[]
}

const AuthorizedRoute: React.FC<Props> = ({
  exact,
  path,
  component: Component,
  permissions
}) => {
  const { isAuthorized } = useCurrentUserContext()

  return (
    <Route
      exact={!!exact}
      path={path}
      render={props =>
        isAuthorized(permissions) ? (
          <Component {...props} />
        ) : (
            <Redirect to='/sales' />
          )
      }
    />
  )
}

export default AuthorizedRoute
