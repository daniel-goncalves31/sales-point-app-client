import React from 'react'
import { Modal, Form, Input, Select } from 'antd'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useUserContext } from '../../../../contexts/UserContext'
import { UserStatus, UserRole } from '../../../../models/user/UserModel'

interface Props {
  visible: boolean
  closeModal: React.Dispatch<React.SetStateAction<boolean>>
}

const AddUserModal: React.FC<Props> = ({ visible, closeModal }) => {
  const { setUsers } = useUserContext()
  const { isLoading, postApi } = usePostApi(
    '/user',
    'POST',
    'Dados inválidos',
    'Usuário Adicionado com sucesso'
  )
  const [form] = Form.useForm()

  const handleOnFinish = async (values: any) => {
    const data = await postApi(values)
    if (data) {
      setUsers(prev => [...prev, data])
      closeModal(false)
    }
  }

  const statusOptions = [{ value: UserStatus.ACTIVE, label: 'Ativo' }, { value: UserStatus.INACTIVE, label: 'Inativo' }]

  const roleOptions = [{ value: UserRole.EMPLOYEE, label: 'Funcionário' }, { value: UserRole.ADMIN, label: 'Administrador' }]

  return (
    <Modal
      style={{ top: '20px' }}
      title='Adicionar Usuário'
      visible={visible}
      onCancel={() => closeModal(false)}
      afterClose={() => form.resetFields()}
      onOk={() => form.submit()}
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={handleOnFinish}
        initialValues={{ status: UserStatus.ACTIVE, role: UserRole.EMPLOYEE }}
      >
        <Form.Item
          label='Nome do Usuário'
          name='name'
          rules={[{ required: true }]}
        >
          <Input placeholder='Nome do Usuário' disabled={isLoading} />
        </Form.Item>

        <Form.Item label='Username' name='username' rules={[{ required: true }]}>
          <Input placeholder='Username' disabled={isLoading} />
        </Form.Item>

        <Form.Item
          label='Senha'
          name='password'
          rules={[{ required: true }]}
        >
          <Input placeholder='Senha' disabled={isLoading} />
        </Form.Item>
        <Form.Item
          label='Status'
          name='status'
          rules={[{ required: true }]}
        >
          <Select options={statusOptions} />
        </Form.Item>
        <Form.Item
          label='Nível'
          name='role'
          rules={[{ required: true }]}
        >
          <Select options={roleOptions} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddUserModal
