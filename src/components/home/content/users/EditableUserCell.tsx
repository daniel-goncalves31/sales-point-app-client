import { ProductModel } from '../../../../models/ProductModel'
import { Input, Form, Select } from 'antd'
import React from 'react'
import { UserRole, UserStatus } from '../../../../models/user/UserModel'

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: any
  record: ProductModel
  index: number
  children: React.ReactNode
}

const statusOptions = [{ value: UserStatus.ACTIVE, label: 'Ativo' }, { value: UserStatus.INACTIVE, label: 'Inativo' }]

const roleOptions = [{ value: UserRole.EMPLOYEE, label: 'Funcionário' }, { value: UserRole.ADMIN, label: 'Administrador' }]

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode =
    dataIndex === 'status' ? (<Select options={statusOptions} />) : (dataIndex === 'role' ? (
      <Select options={roleOptions} />
    ) : (
        <Input />
      ))
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: dataIndex !== 'password',
              message: 'Campo Obrigatório'
            }
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
          children
        )}
    </td>
  )
}

export default EditableCell
