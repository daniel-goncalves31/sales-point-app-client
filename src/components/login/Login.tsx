import React from 'react'
import './login.less'
import { Card, Form, Input, Button } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useCurrentUserContext } from '../../contexts/CurrentUserContext'
import { usePostApi } from '../../hooks/use-post-api'
import { useDialogContext } from '../../contexts/DialogContext'

interface Props { }

const Login: React.FC<Props> = () => {
  const { showError } = useDialogContext()
  const { setCurrentUser } = useCurrentUserContext()
  const { postApi, isLoading } = usePostApi(
    '/login',
    'POST',
    'Username ou senha inválidos.'
  )

  const handleOnFinish = async (values: any) => {
    const data = await postApi(values)
    if (data && data.id) {
      setCurrentUser(data)
    } else {
      showError('Username ou senha inválidos.')
    }
  }

  return (
    <div className='bg-image'>
      <div className='card-container'>
        <div className='logo'></div>
        <Card>
          <Form layout='vertical' onFinish={handleOnFinish}>
            <Form.Item
              label='Username'
              name='username'
              rules={[{ required: true }]}
            >
              <Input
                autoFocus
                prefix={<UserOutlined />}
                placeholder='Username'
                disabled={isLoading}
              />
            </Form.Item>
            <Form.Item
              label='Password'
              name='password'
              rules={[{ required: true }]}
            >
              <Input
                prefix={<LockOutlined />}
                type='password'
                placeholder='Password'
                autoComplete='off'
                disabled={isLoading}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                block
                loading={isLoading}
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}
export default Login
