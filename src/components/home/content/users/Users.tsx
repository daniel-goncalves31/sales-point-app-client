import './users.styles.css'

import {
  Button,
  Divider,
  Form,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import React, { useState } from 'react'
import { UserModel, UserRole, UserStatus } from '../../../../models/user/UserModel'

import AddUserModal from './AddUserModal'
import { EditOutlined } from '@ant-design/icons'
import EditableCell from './EditableUserCell'
import { log } from '../../../../utils/log'
import { usePostApi } from '../../../../hooks/use-post-api'
import { useUserContext } from '../../../../contexts/UserContext'

interface Props { }

const Users: React.FC<Props> = () => {
  const { users, isLoading, setUsers } = useUserContext()
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState('')
  const [showModal, setShowModal] = useState(false)
  const { postApi, isLoading: updatingUser } = usePostApi(
    '/user',
    'PUT',
    'Dados inválidos',
    'Usuário atualizado com sucesso'
  )

  const isEditing = (row: UserModel) => row.id === editingKey

  const edit = (record: UserModel) => {
    form.setFieldsValue({
      ...record,
      password: ''
    })
    setEditingKey(record.id)
  }

  const cancel = () => {
    setEditingKey('')
  }

  const save = async (key: React.Key) => {
    try {
      const updatedUser = (await form.validateFields()) as UserModel
      const newData = [...users]
      const index = newData.findIndex(item => key === item.id)
      const prevUser = newData[index]

      if (!updatedUser.password) {
        delete updatedUser.password
      }
      if (prevUser.role === UserRole.ADMIN_MASTER) {
        updatedUser.role = UserRole.ADMIN_MASTER
        updatedUser.status = UserStatus.ACTIVE
      }
      const res = await postApi({ ...updatedUser, id: prevUser.id })

      if (res) {
        newData.splice(index, 1, {
          ...prevUser,
          ...updatedUser
        })
        setUsers([...newData])
        setEditingKey('')
      }
    } catch (error) {
      log(error, true)
    }
  }

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      showSorterTooltip: false,
      sorter: (a: UserModel, b: UserModel) => a.name.localeCompare(b.name)
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      showSorterTooltip: false,
      sorter: (a: UserModel, b: UserModel) => a.username.localeCompare(b.username)
    },
    {
      title: 'Senha',
      dataIndex: 'password',
      key: 'password',
      showSorterTooltip: false,
      sorter: (a: UserModel, b: UserModel) => a.password!.localeCompare(b.password!)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      showSorterTooltip: false,
      align: 'center',
      sorter: (a: UserModel, b: UserModel) => a.status.localeCompare(b.status),
      defaultSortOrder: 'ascend',
      render: (val: UserStatus) => {
        return val === UserStatus.INACTIVE ? (
          <Tag color='volcano'>Inativo</Tag>
        ) : (
            <Tag color='green'>Ativo</Tag>
          )
      }
    },
    {
      title: 'Nível',
      dataIndex: 'role',
      key: 'role',
      showSorterTooltip: false,
      align: 'center',
      sorter: (a: UserModel, b: UserModel) => a.role.localeCompare(b.role),
      render: (val: UserRole) => {
        return val === UserRole.EMPLOYEE ? (
          <Tag color='gold'>Funcionário</Tag>
        ) : (val === UserRole.ADMIN ? (
          <Tag color='geekblue'>Administrador</Tag>
        ) : <Tag color='cyan'>Administrador Master</Tag>)
      }
    },
    {
      title: '#',
      key: '#',
      showSorterTooltip: false,

      align: 'center',
      render: (_: any, record: UserModel) => {
        const editable = isEditing(record)
        return editable ? (
          <Space>
            <Popconfirm
              title='Tem certeza que deseja salvar?'
              onConfirm={() => save(record.id)}
            >
              <span className='edit-option'>Salvar</span>
            </Popconfirm>
            <span className='edit-option' onClick={cancel}>
              Cancelar
            </span>
          </Space>
        ) : (
            <Tooltip title='Editar Usuário'>
              <EditOutlined
                disabled={editingKey !== ''}
                onClick={() => edit(record)}
              />
            </Tooltip>
          )
      }
    }
  ]

  const mergedColumns = columns.map(col => {
    if (col.title === '#') {
      return col
    }
    return {
      ...col,
      onCell: (record: UserModel) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })
  return (
    <>
      <AddUserModal closeModal={setShowModal} visible={showModal} />
      <Typography.Title style={{ marginBottom: '0', display: 'inline-block' }}>
        Gerenciar Usuários
      </Typography.Title>
      <Divider style={{ margin: '8px 0' }} />
      <Space align='center' style={{ marginBottom: '8px' }}>
        <Button type='primary' onClick={() => setShowModal(true)}>
          Adicionar Usuário
        </Button>
      </Space>
      <Form form={form} component={false}>
        <Table
          size='small'
          columns={mergedColumns as any}
          dataSource={users?.map((row: UserModel) => ({
            ...row,
            key: row.id,
            password: '*********'
          }))}
          components={{
            body: {
              cell: EditableCell
            }
          }}
          loading={isLoading || updatingUser}
          pagination={{
            onChange: cancel
          }}
        />
      </Form>
    </>
  )
}

export default Users
